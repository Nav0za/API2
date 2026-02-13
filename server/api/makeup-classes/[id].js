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
    const getMakeupStmt = db.prepare('SELECT * FROM makeup_classes WHERE id_makeup = ?')
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

    // ถ้ามีการเปลี่ยนวัน/เวลา ให้อัปเดต calendar_events ด้วย
    const dateChanged = body.makeup_date && body.makeup_date !== oldData.makeup_date
    const timeChanged = (body.makeup_time_start && body.makeup_time_start !== oldData.makeup_time_start) ||
      (body.makeup_time_end && body.makeup_time_end !== oldData.makeup_time_end)

    if (dateChanged || timeChanged) {
      const newDate = body.makeup_date || oldData.makeup_date
      const newTimeStart = body.makeup_time_start || oldData.makeup_time_start
      const newTimeEnd = body.makeup_time_end || oldData.makeup_time_end

      // อัปเดต calendar event
      const updateEventStmt = db.prepare(`
        UPDATE calendar_events 
        SET start = ?,
            end = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE start LIKE ? 
          AND teacher_id = ?
          AND event_type = 'makeup_class'
      `)

      const oldDatePattern = `${oldData.makeup_date}%`
      const newStart = `${newDate}T${newTimeStart}:00`
      const newEnd = `${newDate}T${newTimeEnd}:00`

      updateEventStmt.run(newStart, newEnd, oldDatePattern, oldData.teacher_id)
    }

    // ถ้าเปลี่ยนสถานะเป็น cancelled ให้ลบ calendar event
    if (body.status === 'cancelled' && oldData.status !== 'cancelled') {
      const deleteEventStmt = db.prepare(`
        DELETE FROM calendar_events 
        WHERE start LIKE ? 
          AND teacher_id = ?
          AND event_type = 'makeup_class'
      `)

      const datePattern = `${oldData.makeup_date}%`
      deleteEventStmt.run(datePattern, oldData.teacher_id)
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

    // 2. ลบ calendar event ที่เกี่ยวข้อง (หา event ที่มี makeup_date และ teacher_id ตรงกัน)
    // ใช้ LIKE เพื่อจับ event ที่มี start เป็น makeup_date + เวลา
    const deleteEventStmt = db.prepare(`
      DELETE FROM calendar_events 
      WHERE start LIKE ? 
        AND teacher_id = ?
        AND event_type = 'makeup_class'
    `)

    const datePattern = `${makeupClass.makeup_date}%`
    deleteEventStmt.run(datePattern, makeupClass.teacher_id)

    // 3. ลบคลาสชดเชย
    const deleteMakeupStmt = db.prepare('DELETE FROM makeup_classes WHERE id_makeup = ?')
    const result = deleteMakeupStmt.run(id)

    return { success: true, deleted: result.changes > 0 }
  }
})
