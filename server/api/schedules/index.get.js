import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { id_teacher, term } = query

  // ถ้ามีการส่ง id_teacher และ term มา
  if (id_teacher && term) {
    const tId = Number(id_teacher)
    const stmt = db.prepare(
      'SELECT * FROM schedules WHERE id_teacher = ? AND term = ?'
    )
    const schedule = stmt.get(tId, term)

    if (schedule) {
      // Parse JSON กลับมาเป็น array
      schedule.scheduleData = JSON.parse(schedule.scheduleData)
    }

    return schedule || null
  }

  // ถ้าส่งแค่ id_teacher
  if (id_teacher) {
    const tId = Number(id_teacher)
    const stmt = db.prepare('SELECT * FROM schedules WHERE id_teacher = ?')
    const schedules = stmt.all(tId)

    return schedules.map(s => ({
      ...s,
      scheduleData: JSON.parse(s.scheduleData)
    }))
  }

  // ถ้าไม่ส่งอะไรมา ดึงทั้งหมด
  const stmt = db.prepare('SELECT * FROM schedules')
  const schedules = stmt.all()

  return schedules.map(s => ({
    ...s,
    scheduleData: JSON.parse(s.scheduleData)
  }))
})
