import db from '../../utils/db.js'
import { syncSectionToTeachers } from '../../utils/scheduleSync.js'

const getSubjectCanonicalId = (subjectId) => {
  const subject = db.prepare(`
    SELECT id_subject, id_plan_subject, curriculum_subject_id
    FROM Subjects
    WHERE id_subject = ?
  `).get(subjectId)

  if (!subject) return Number(subjectId)

  const baseKey = subject.id_plan_subject || subject.curriculum_subject_id
  if (baseKey == null) return Number(subjectId)

  const canonical = db.prepare(`
    SELECT id_subject
    FROM Subjects
    WHERE id_plan_subject = ? OR curriculum_subject_id = ?
    ORDER BY CASE
      WHEN id_plan_subject = ? THEN 0
      WHEN curriculum_subject_id = ? THEN 1
      ELSE 2
    END, id_subject ASC
    LIMIT 1
  `).get(baseKey, baseKey, baseKey, baseKey)

  return Number(canonical?.id_subject || subjectId)
}

const getPrimaryTeacherRefsForSubject = (subjectId) => {
  const subject = db.prepare(`
    SELECT id_teacher, external_teacher_name
    FROM Subjects
    WHERE id_subject = ?
  `).get(Number(subjectId))

  if (!subject) return []
  if (subject.id_teacher != null) return [Number(subject.id_teacher)]
  if (subject.external_teacher_name) return [`ext:${Number(subjectId)}`]
  return []
}

const normalizeTeacherRefs = (refs = []) => {
  const normalized = []
  for (const ref of refs || []) {
    if (ref === null || ref === undefined || ref === '') continue
    if (typeof ref === 'string' && ref.startsWith('ext:')) {
      normalized.push(ref)
      continue
    }
    const n = Number(ref)
    if (Number.isFinite(n)) normalized.push(n)
  }
  return [...new Set(normalized.map(v => String(v)))].map(v => (v.startsWith('ext:') ? v : Number(v)))
}

const normalizeSchedule = (schedule = []) => {
  if (!Array.isArray(schedule)) return schedule

  return schedule.map(day =>
    Array.isArray(day)
      ? day.map(slot => {
        if (!slot || typeof slot !== 'object') return slot
        const normalizedTeacherIds = normalizeTeacherRefs(slot.teacher_ids || [])
        if (!slot.value) {
          return {
            ...slot,
            teacher_ids: normalizedTeacherIds
          }
        }
        if (typeof slot.value === 'string' && slot.value.startsWith('ext:')) {
          return {
            ...slot,
            teacher_ids: normalizedTeacherIds
          }
        }

        const canonicalId = getSubjectCanonicalId(slot.value)
        return {
          ...slot,
          value: canonicalId,
          teacher_ids: normalizedTeacherIds
        }
      })
      : day
  )
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate
  if (!body.schedule || !body.id_section || !body.term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'schedule, id_section, and term are required'
    })
  }

  const sectionId = Number(body.id_section)
  const term = body.term
  const normalizedSchedule = normalizeSchedule(body.schedule)
  const jsonSchedule = JSON.stringify(normalizedSchedule)

  console.log(`[API] Saving section schedule for section ${sectionId}, term ${term}`)

  // เช็คว่ามีตารางของกลุ่มนี้ในเทอมนี้อยู่แล้วหรือไม่
  const existing = db.prepare(`
    SELECT id_section_schedule, scheduleData
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
  const previousSchedule = existing?.scheduleData ? JSON.parse(existing.scheduleData) : null
  syncSectionToTeachers(sectionId, term, normalizedSchedule, previousSchedule)

  return returnData
})
