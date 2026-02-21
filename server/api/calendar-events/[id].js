// server/api/calendar-events/[id].js
import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  // PUT - อัปเดตกิจกรรม
  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)

    db.prepare(`
      UPDATE calendar_events 
      SET title = COALESCE(?, title),
          start = COALESCE(?, start),
          end = COALESCE(?, end),
          background_color = COALESCE(?, background_color),
          border_color = COALESCE(?, border_color),
          teacher_id = COALESCE(?, teacher_id),
          teacher_name = COALESCE(?, teacher_name),
          description = COALESCE(?, description),
          original_date = COALESCE(?, original_date),
          makeup_class_ids = COALESCE(?, makeup_class_ids),
          updated_at = CURRENT_TIMESTAMP
      WHERE id_event = ?
    `).run(
      body.title || null,
      body.start || null,
      body.end || null,
      body.backgroundColor || null,
      body.borderColor || null,
      body.extendedProps?.teacherId || null,
      body.extendedProps?.teacherName || null,
      body.extendedProps?.description || null,
      body.extendedProps?.originalDate || null,
      body.extendedProps?.makeupClassIds || null,
      id
    )

    return { success: true }
  }

  // DELETE - ลบกิจกรรม
  if (event.node.req.method === 'DELETE') {
    // ดึงข้อมูลกิจกรรมก่อนลบเพื่อดูประเภท
    const eventDetails = db.prepare('SELECT * FROM calendar_events WHERE id_event = ?').get(id)

    if (!eventDetails) return { success: true }

    // ถ้าเป็นคลาสชดเชย
    if (eventDetails.event_type === 'makeup_class') {
      // 1. ลบจากตาราง makeup_classes
      if (eventDetails.makeup_class_ids) {
        try {
          const ids = JSON.parse(eventDetails.makeup_class_ids)
          if (Array.isArray(ids)) {
            const placeholders = ids.map(() => '?').join(',')
            db.prepare(`DELETE FROM makeup_classes WHERE id_makeup IN (${placeholders})`).run(...ids)
          }
        } catch (e) {
          console.error('Error parsing makeup_class_ids:', e)
        }
      }

      // 2. ตรวจสอบว่าต้องลบ teacher_absence ด้วยหรือไม่ (ถ้าไม่มีคลาสชดเชยอื่นเหลือแล้วสำหรับวันนี้)
      if (eventDetails.original_date && eventDetails.teacher_id) {
        const otherMakeups = db.prepare(`
          SELECT COUNT(*) as count FROM calendar_events 
          WHERE teacher_id = ? AND original_date = ? AND event_type = 'makeup_class' AND id_event != ?
        `).get(eventDetails.teacher_id, eventDetails.original_date, id)

        if (otherMakeups.count === 0) {
          // ลบกิจกรรม teacher_absence (ติดธุระ) สำหรับวันนั้น
          db.prepare(`
            DELETE FROM calendar_events 
            WHERE teacher_id = ? AND start = ? AND event_type = 'teacher_absence'
          `).run(eventDetails.teacher_id, eventDetails.original_date)
        }
      }
    }

    // ลบกิจกรรมหลัก
    db.prepare(`
      DELETE FROM calendar_events WHERE id_event = ?
    `).run(id)

    return { success: true }
  }
})
