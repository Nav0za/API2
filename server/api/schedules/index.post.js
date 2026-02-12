import db from '../../utils/db.js'
import { syncTeacherToSections } from '../../utils/scheduleSync.js'

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
  const teacherId = Number(body.id_teacher)
  const term = body.term

  console.log(`[API] Saving teacher schedule for teacher ${teacherId}, term ${term}`)

  // 1. Save Teacher Schedule (Existing Logic)
  const existing = db.prepare(
    'SELECT id_schedule FROM schedules WHERE id_teacher = ? AND term = ?'
  ).get(teacherId, term)

  let result
  if (existing) {
    const stmt = db.prepare(
      'UPDATE schedules SET scheduleData = ? WHERE id_teacher = ? AND term = ?'
    )
    stmt.run(jsonSchedule, teacherId, term)
    result = { id: existing.id_schedule, message: 'Schedule updated' }
  } else {
    const stmt = db.prepare(
      'INSERT INTO schedules (scheduleData, id_teacher, term) VALUES (?, ?, ?)'
    )
    const res = stmt.run(jsonSchedule, teacherId, term)
    result = { id: res.lastInsertRowid, message: 'Schedule created' }
  }

  // --- Auto-Sync Logic ---
  syncTeacherToSections(teacherId, term, body.schedule)

  return {
    ...result,
    schedule: jsonSchedule,
    syncMessage: 'Teacher schedule saved and sections synchronized.'
  }
})
