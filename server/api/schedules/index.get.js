import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const stmt = db.prepare('SELECT * FROM schedules')
  const schedules = stmt.all()
  return schedules
})
