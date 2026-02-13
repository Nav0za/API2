import db from '../../utils/db.js'
import { syncSectionToTeachers } from '../../utils/scheduleSync.js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Validate
    if (!body.schedule || !body.id_section || !body.term) {
        throw createError({
            statusCode: 400,
            statusMessage: 'schedule, id_section, and term are required'
        })
    }

    const jsonSchedule = JSON.stringify(body.schedule)
    const sectionId = Number(body.id_section)
    const term = body.term

    console.log(`[API] Saving section schedule for section ${sectionId}, term ${term}`)

    // เช็คว่ามีตารางของกลุ่มนี้ในเทอมนี้อยู่แล้วหรือไม่
    const existing = db.prepare(`
    SELECT id_section_schedule 
    FROM section_schedules 
    WHERE id_section = ? AND term = ?
  `).get(sectionId, term)

    let returnData
    if (existing) {
        // ถ้ามีแล้ว ให้ UPDATE
        const stmt = db.prepare(`
      UPDATE section_schedules 
      SET scheduleData = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id_section = ? AND term = ?
    `)
        stmt.run(jsonSchedule, sectionId, term)

        returnData = {
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
        const res = stmt.run(jsonSchedule, sectionId, term)

        returnData = {
            id: res.lastInsertRowid,
            schedule: jsonSchedule,
            message: 'Schedule created successfully'
        }
    }

    // --- Auto-Sync Logic ---
    syncSectionToTeachers(sectionId, term, body.schedule)

    return returnData
})
