import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  // GET - ดึงข้อมูลคลาสชดเชยตัวเดียว
  if (event.node.req.method === 'GET') {
    const stmt = db.prepare(`
      SELECT 
        mc.*,
        t.name as teacher_name,
        s.section_name,
        sub.name_subject,
        r.room_name
      FROM makeup_classes mc
      LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
      LEFT JOIN sections s ON mc.section_id = s.id_section
      LEFT JOIN Subjects sub ON mc.subject_id = sub.id_subject
      LEFT JOIN rooms r ON mc.room_id = r.id_room
      WHERE mc.id_makeup = ?
    `)

    const makeupClass = stmt.get(id)

    if (!makeupClass) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    return makeupClass
  }

  // PUT - อัปเดตคลาสชดเชย (เช่น เปลี่ยน status, เพิ่มห้อง)
  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)

    // ดึงข้อมูลเดิมก่อนอัปเดต
    const getMakeupStmt = db.prepare(`
      SELECT mc.*, t.name as teacher_name 
      FROM makeup_classes mc 
      LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
      WHERE mc.id_makeup = ?
    `)
    const oldData = getMakeupStmt.get(id)

    if (!oldData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    // อัปเดต makeup_classes
    const stmt = db.prepare(`
      UPDATE makeup_classes 
      SET status = COALESCE(?, status),
          room_id = COALESCE(?, room_id),
          notes = COALESCE(?, notes),
          makeup_date = COALESCE(?, makeup_date),
          makeup_time_start = COALESCE(?, makeup_time_start),
          makeup_time_end = COALESCE(?, makeup_time_end),
          updated_at = CURRENT_TIMESTAMP
      WHERE id_makeup = ?
    `)

    const result = stmt.run(
      body.status || null,
      body.room_id !== undefined ? body.room_id : null,
      body.notes !== undefined ? body.notes : null,
      body.makeup_date || null,
      body.makeup_time_start || null,
      body.makeup_time_end || null,
      id
    )

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    // ฟังก์ชันช่วยในการอัปเดต Consolidated Calendar Event
    const syncCalendarEvent = async (date, teacherId) => {
      const datePattern = `${date}%`
      const classes = db.prepare(`
        SELECT mc.*, s.name_subject, r.room_name, t.name as teacher_name
        FROM makeup_classes mc
        LEFT JOIN Subjects s ON mc.subject_id = s.id_subject
        LEFT JOIN rooms r ON mc.room_id = r.id_room
        LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
        WHERE mc.teacher_id = ? AND mc.makeup_date = ? AND mc.status != 'cancelled'
        ORDER BY mc.makeup_time_start ASC
      `).all(teacherId, date)

      // ค้นหา event เดิม
      const existingEvent = db.prepare(`
        SELECT * FROM calendar_events 
        WHERE teacher_id = ? AND start LIKE ? AND event_type = 'makeup_class'
      `).get(teacherId, datePattern)

      if (classes.length > 0) {
        const first = classes[0]
        const last = classes[classes.length - 1]
        const title = `สอนชดเชย - ${first.teacher_name}${classes.length > 1 ? ` (${classes.length} วิชา)` : ''}`
        const start = `${date}T${first.makeup_time_start}:00`
        const end = `${date}T${last.makeup_time_end}:00`
        const desc = `ห้อง: ${first.room_name || 'ไม่ระบุ'}\n${classes.map(c => c.name_subject).join(', ')}`
        const idsJson = JSON.stringify(classes.map(c => c.id_makeup))

        if (existingEvent) {
          db.prepare(`
            UPDATE calendar_events 
            SET title = ?, start = ?, end = ?, description = ?, makeup_class_ids = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id_event = ?
          `).run(title, start, end, desc, idsJson, existingEvent.id_event)
        } else {
          db.prepare(`
            INSERT INTO calendar_events 
            (title, start, end, background_color, border_color, teacher_id, teacher_name, description, event_type, makeup_class_ids, original_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(title, start, end, '#10b981', '#10b981', teacherId, first.teacher_name, desc, 'makeup_class', idsJson, first.original_date)
        }
      } else if (existingEvent) {
        // ไม่เหลือ class แล้ว แต่มี event อยู่ -> ลบ event
        db.prepare('DELETE FROM calendar_events WHERE id_event = ?').run(existingEvent.id_event)
      }
    }

    // ถ้ามีการเปลี่ยน วัน/เวลา/ห้อง/สถานะ ให้อัปเดตปฏิทิน
    const dateChanged = body.makeup_date && body.makeup_date !== oldData.makeup_date
    const timeChanged = (body.makeup_time_start && body.makeup_time_start !== oldData.makeup_time_start) ||
      (body.makeup_time_end && body.makeup_time_end !== oldData.makeup_time_end)
    const roomChanged = body.room_id !== undefined && body.room_id !== oldData.room_id
    const statusChanged = body.status && body.status !== oldData.status

    if (dateChanged || timeChanged || roomChanged || statusChanged) {
      // 1. อัปเดตวันใหม่ (หรือวันเดิมถ้าแค่เปลี่ยนเวลา/ห้อง)
      await syncCalendarEvent(body.makeup_date || oldData.makeup_date, oldData.teacher_id)

      // 2. ถ้าเปลี่ยนวัน ต้องอัปเดตวันเก่าด้วย (เพื่อลบ id ออกจาก consolidated event เดิม)
      if (dateChanged) {
        await syncCalendarEvent(oldData.makeup_date, oldData.teacher_id)
      }
    }

    return { success: true, changes: result.changes }
  }

  // DELETE - ลบคลาสชดเชย (และลบ event ในปฏิทินด้วย)
  if (event.node.req.method === 'DELETE') {
    // 1. ดึงข้อมูลคลาสชดเชยก่อนลบ
    const getMakeupStmt = db.prepare('SELECT * FROM makeup_classes WHERE id_makeup = ?')
    const makeupClass = getMakeupStmt.get(id)

    if (!makeupClass) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    // 2. จัดการ Calendar Event
    // ค้นหา event ของวันนี้สำหรับอาจารย์คนนี้
    const datePattern = `${makeupClass.makeup_date}%`
    const existingEvent = db.prepare(`
      SELECT * FROM calendar_events 
      WHERE teacher_id = ? AND start LIKE ? AND event_type = 'makeup_class'
    `).get(makeupClass.teacher_id, datePattern)

    if (existingEvent) {
      let makeupIds = []
      try {
        makeupIds = JSON.parse(existingEvent.makeup_class_ids || '[]')
      } catch (e) {
        console.error('Error parsing makeup_class_ids:', e)
      }

      // กรอง id ที่กำลังจะลบออก
      const remainingIds = makeupIds.filter(mid => mid != id)

      if (remainingIds.length > 0) {
        // ยังมีเหลือ -> อัปเดต event
        const remainingClasses = db.prepare(`
          SELECT mc.*, s.name_subject, r.room_name 
          FROM makeup_classes mc
          LEFT JOIN Subjects s ON mc.subject_id = s.id_subject
          LEFT JOIN rooms r ON mc.room_id = r.id_room
          WHERE mc.id_makeup IN (${remainingIds.map(() => '?').join(',')})
          ORDER BY mc.makeup_time_start ASC
        `).all(...remainingIds)

        if (remainingClasses.length > 0) {
          const first = remainingClasses[0]
          const last = remainingClasses[remainingClasses.length - 1]
          const title = `สอนชดเชย - ${existingEvent.teacher_name}${remainingClasses.length > 1 ? ` (${remainingClasses.length} วิชา)` : ''}`
          const start = `${makeupClass.makeup_date}T${first.makeup_time_start}:00`
          const end = `${makeupClass.makeup_date}T${last.makeup_time_end}:00`
          const desc = `ห้อง: ${remainingClasses[0].room_name || 'ไม่ระบุ'}\n${remainingClasses.map(c => c.name_subject).join(', ')}`

          db.prepare(`
            UPDATE calendar_events 
            SET title = ?, start = ?, end = ?, description = ?, makeup_class_ids = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id_event = ?
          `).run(title, start, end, desc, JSON.stringify(remainingIds), existingEvent.id_event)
        }
      } else {
        // ไม่เหลือแล้ว -> ลบ event
        db.prepare('DELETE FROM calendar_events WHERE id_event = ?').run(existingEvent.id_event)

        // และลบ teacher_absence (ติดธุระ) ถ้าไม่มี makeup class อื่นค้างอยู่แล้ว (จากเดิมที่เคยจัดชดเชยวันอื่นอาจจะมี)
        // แต่ปกติ 1 absence = 1 set of makeup classes. ถ้า last makeup class ถูกลบ ก็ควรลบ absence ด้วย
        // ค้นหาว่ายังมีการจัดชดเชยอื่นสำหรับ "วันที่มีปัญหา (original_date)" นี้อีกไหม
        if (makeupClass.original_date) {
          const otherMakeups = db.prepare(`
              SELECT COUNT(*) as count FROM makeup_classes 
              WHERE teacher_id = ? AND original_date = ? AND id_makeup != ?
            `).get(makeupClass.teacher_id, makeupClass.original_date, id)

          if (otherMakeups.count === 0) {
            db.prepare(`
                DELETE FROM calendar_events 
                WHERE teacher_id = ? AND start = ? AND event_type = 'teacher_absence'
              `).run(makeupClass.teacher_id, makeupClass.original_date)
          }
        }
      }
    }

    // 3. ลบคลาสชดเชยตัวจริง
    const deleteMakeupStmt = db.prepare('DELETE FROM makeup_classes WHERE id_makeup = ?')
    const result = deleteMakeupStmt.run(id)

    return { success: true, deleted: result.changes > 0 }
  }
})
