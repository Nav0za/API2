// server/api/calendar-events.js
import db from '../utils/db.js'

export default defineEventHandler(async (event) => {
  // GET - ดึงข้อมูลกิจกรรมทั้งหมด
  if (event.node.req.method === 'GET') {
    const events = db.prepare(`
      SELECT * FROM calendar_events ORDER BY start ASC
    `).all()

    return events.map(e => ({
      id: e.id_event,
      title: e.title,
      start: e.start,
      end: e.end,
      backgroundColor: e.background_color,
      borderColor: e.border_color,
      extendedProps: {
        teacherId: e.teacher_id,
        teacherName: e.teacher_name,
        description: e.description
      }
    }))
  }

  // POST - เพิ่มกิจกรรมใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    const result = db.prepare(`
      INSERT INTO calendar_events 
      (title, start, end, background_color, border_color, teacher_id, teacher_name, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.title,
      body.start,
      body.end,
      body.backgroundColor,
      body.borderColor,
      body.extendedProps?.teacherId || null,
      body.extendedProps?.teacherName || null,
      body.extendedProps?.description || null
    )

    return {
      id: result.lastInsertRowid,
      ...body
    }
  }
})
