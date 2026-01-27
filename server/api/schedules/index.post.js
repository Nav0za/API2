import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate
  if (!body.schedule || !body.id_teacher || !body.term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'schedule, id_teacher, and term are required'
    })
  }

  const jsonSchedule = JSON.stringify(body.schedule)

  // เช็คว่ามีตารางของอาจารย์คนนี้ในเทอมนี้อยู่แล้วหรือไม่
  const existing = db.prepare(
    'SELECT id_schedule FROM schedules WHERE id_teacher = ? AND term = ?'
  ).get(body.id_teacher, body.term)

  if (existing) {
    // ถ้ามีแล้ว ให้ UPDATE
    const stmt = db.prepare(
      'UPDATE schedules SET scheduleData = ? WHERE id_teacher = ? AND term = ?'
    )
    stmt.run(jsonSchedule, body.id_teacher, body.term)

    return {
      id: existing.id_schedule,
      schedule: jsonSchedule,
      message: 'Schedule updated successfully'
    }
  } else {
    // ถ้ายังไม่มี ให้ INSERT
    const stmt = db.prepare(
      'INSERT INTO schedules (scheduleData, id_teacher, term) VALUES (?, ?, ?)'
    )
    const res = stmt.run(jsonSchedule, body.id_teacher, body.term)

    return {
      id: res.lastInsertRowid,
      schedule: jsonSchedule,
      message: 'Schedule created successfully'
    }
  }
})
