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
      SET status = ?,
          room_id = ?,
          notes = ?,
          makeup_date = ?,
          makeup_time_start = ?,
          makeup_time_end = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id_makeup = ?
    `)

    const result = stmt.run(
      body.status !== undefined ? body.status : oldData.status,
      body.room_id !== undefined ? body.room_id : oldData.room_id,
      body.notes !== undefined ? body.notes : oldData.notes,
      body.makeup_date !== undefined ? body.makeup_date : oldData.makeup_date,
      body.makeup_time_start !== undefined ? body.makeup_time_start : oldData.makeup_time_start,
      body.makeup_time_end !== undefined ? body.makeup_time_end : oldData.makeup_time_end,
      id
    )

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    // ฟังก์ชันช่วยในการอัปเดต Calendar Event แบบ 1-to-1
    const syncCalendarEvent = async (makeupId) => {
      // ค้นหาข้อมูล makeup class ปัจจุบัน
      const cls = db.prepare(`
        SELECT mc.*, s.name_subject, r.room_name, t.name as teacher_name
        FROM makeup_classes mc
        LEFT JOIN Subjects s ON mc.subject_id = s.id_subject
        LEFT JOIN rooms r ON mc.room_id = r.id_room
        LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
        WHERE mc.id_makeup = ?
      `).get(makeupId)

      // ค้นหา event เดิมบนปฏิทินที่ผูกกับ id_makeup นี้
      const targetIdStr = `[${makeupId}]`
      const existingEvent = db.prepare(`
        SELECT * FROM calendar_events 
        WHERE event_type = 'makeup_class' AND makeup_class_ids = ?
      `).get(targetIdStr)

      if (cls && cls.status === 'confirmed' && cls.makeup_date) {
        // ต้องมีแสดงในปฏิทิน
        const title = `สอนชดเชย - ${cls.teacher_name} (${cls.name_subject})`
        const start = `${cls.makeup_date}T${cls.makeup_time_start}:00`
        const end = `${cls.makeup_date}T${cls.makeup_time_end}:00`
        const desc = `วิชา: ${cls.name_subject}\nห้อง: ${cls.room_name || 'ไม่ระบุ'}${cls.notes ? '\n' + cls.notes : ''}`

        if (existingEvent) {
          db.prepare(`
            UPDATE calendar_events 
            SET title = ?, start = ?, end = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id_event = ?
          `).run(title, start, end, desc, existingEvent.id_event)
        } else {
          db.prepare(`
            INSERT INTO calendar_events 
            (title, start, end, background_color, border_color, teacher_id, teacher_name, description, event_type, makeup_class_ids, original_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(title, start, end, '#10b981', '#10b981', cls.teacher_id, cls.teacher_name, desc, 'makeup_class', targetIdStr, cls.original_date)
        }
      } else if (existingEvent) {
        // ถ้า status ไม่ใช่ confirmed หรือไม่มี date แล้ว ให้ลบทิ้ง
        db.prepare('DELETE FROM calendar_events WHERE id_event = ?').run(existingEvent.id_event)
      }
    }

    // ถ้ามีการเปลี่ยน วัน/เวลา/ห้อง/สถานะ ให้อัปเดตปฏิทิน
    const newDate = body.makeup_date !== undefined ? body.makeup_date : oldData.makeup_date
    const dateChanged = newDate !== oldData.makeup_date
    const timeChanged = (body.makeup_time_start !== undefined && body.makeup_time_start !== oldData.makeup_time_start) ||
      (body.makeup_time_end !== undefined && body.makeup_time_end !== oldData.makeup_time_end)
    const roomChanged = body.room_id !== undefined && body.room_id !== oldData.room_id
    const statusChanged = body.status !== undefined && body.status !== oldData.status

    if (dateChanged || timeChanged || roomChanged || statusChanged) {
      // อัปเดต event ของ id_makeup นี้แบบเจาะจง
      await syncCalendarEvent(id)
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

    // 2. ลบ calendar event ของ id นี้แบบเฉพาะเจาะจง
    const targetIdStr = `[${id}]`
    const deleteEventStmt = db.prepare(`
      DELETE FROM calendar_events 
      WHERE event_type = 'makeup_class' AND makeup_class_ids = ?
    `)
    deleteEventStmt.run(targetIdStr)

    // 3. ลบคลาสชดเชยตัวจริง
    const deleteMakeupStmt = db.prepare('DELETE FROM makeup_classes WHERE id_makeup = ?')
    const result = deleteMakeupStmt.run(id)

    return { success: true, deleted: result.changes > 0 }
  }
})
