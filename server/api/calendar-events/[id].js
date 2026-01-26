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
      id
    )

    return { success: true }
  }

  // DELETE - ลบกิจกรรม
  if (event.node.req.method === 'DELETE') {
    db.prepare(`
      DELETE FROM calendar_events WHERE id_event = ?
    `).run(id)

    return { success: true }
  }
})
