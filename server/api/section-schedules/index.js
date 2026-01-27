import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { id_section, term } = query

  // GET - ดึงตารางเรียน
  if (event.node.req.method === 'GET') {
    if (id_section && term) {
      // ดึงตามกลุ่มและเทอม
      const stmt = db.prepare(`
        SELECT * FROM section_schedules 
        WHERE id_section = ? AND term = ?
      `)
      const schedule = stmt.get(id_section, term)

      if (schedule) {
        schedule.scheduleData = JSON.parse(schedule.scheduleData)
      }

      return schedule || null
    }

    if (id_section) {
      // ดึงตามกลุ่ม
      const stmt = db.prepare(`
        SELECT * FROM section_schedules 
        WHERE id_section = ?
      `)
      const schedules = stmt.all(id_section)

      return schedules.map(s => ({
        ...s,
        scheduleData: JSON.parse(s.scheduleData)
      }))
    }

    // ดึงทั้งหมด
    const stmt = db.prepare('SELECT * FROM section_schedules')
    const schedules = stmt.all()

    return schedules.map(s => ({
      ...s,
      scheduleData: JSON.parse(s.scheduleData)
    }))
  }

  // POST - บันทึกตารางเรียน (INSERT หรือ UPDATE)
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    // Validate
    if (!body.schedule || !body.id_section || !body.term) {
      throw createError({
        statusCode: 400,
        statusMessage: 'schedule, id_section, and term are required'
      })
    }

    const jsonSchedule = JSON.stringify(body.schedule)

    // เช็คว่ามีตารางของกลุ่มนี้ในเทอมนี้อยู่แล้วหรือไม่
    const existing = db.prepare(`
      SELECT id_section_schedule 
      FROM section_schedules 
      WHERE id_section = ? AND term = ?
    `).get(body.id_section, body.term)

    if (existing) {
      // ถ้ามีแล้ว ให้ UPDATE
      const stmt = db.prepare(`
        UPDATE section_schedules 
        SET scheduleData = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id_section = ? AND term = ?
      `)
      stmt.run(jsonSchedule, body.id_section, body.term)

      return {
        id: existing.id_section_schedule,
        schedule: jsonSchedule,
        message: 'Schedule updated successfully'
      }
    } else {
      // ถ้ายังไม่มี ให้ INSERT
      const stmt = db.prepare(`
        INSERT INTO section_schedules (scheduleData, id_section, term)
        VALUES (?, ?, ?)
      `)
      const res = stmt.run(jsonSchedule, body.id_section, body.term)

      return {
        id: res.lastInsertRowid,
        schedule: jsonSchedule,
        message: 'Schedule created successfully'
      }
    }
  }
})
