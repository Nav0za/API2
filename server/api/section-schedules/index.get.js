import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { id_section, term } = query

    // ดึงตามกลุ่มและเทอม
    if (id_section && term) {
        const sId = Number(id_section)
        const stmt = db.prepare(`
      SELECT * FROM section_schedules 
      WHERE id_section = ? AND term = ?
    `)
        const schedule = stmt.get(sId, term)

        if (schedule) {
            schedule.scheduleData = JSON.parse(schedule.scheduleData)
        }

        return schedule || null
    }

    // ดึงตามกลุ่ม
    if (id_section) {
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
})
