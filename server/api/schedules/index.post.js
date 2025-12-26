import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const jsonSchedule = JSON.stringify(body.schedule)

  const stmt = db.prepare('INSERT INTO schedules (scheduleData, id_teachers) VALUES (?, ?)')
  const res = stmt.run(jsonSchedule, body.id_teacher)
  return { id: res.lastInsertRowid, schedule: jsonSchedule }
})
