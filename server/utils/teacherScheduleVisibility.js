import db from './db.js'

const hiddenCache = new Map()

export const isTeacherScheduleHiddenSubject = (subjectId) => {
  const rawId = Number(subjectId)
  if (!Number.isFinite(rawId)) return false

  if (hiddenCache.has(rawId)) {
    return hiddenCache.get(rawId)
  }

  const row = db.prepare(`
    SELECT
      s.hide_in_teacher_schedule,
      cs.name_subject AS curriculum_name,
      cs.subject_code
    FROM Subjects s
    LEFT JOIN curriculum_subjects cs ON s.curriculum_subject_id = cs.id_subject_curr
    WHERE s.id_subject = ?
  `).get(rawId)

  const hidden = !!row && (
    Number(row.hide_in_teacher_schedule) === 1
    || /ฝึกงาน/.test(row.curriculum_name || '')
    || /ฝึกงาน/.test(row.subject_code || '')
  )

  hiddenCache.set(rawId, hidden)
  return hidden
}

export const sanitizeTeacherSchedule = (schedule = []) => {
  if (!Array.isArray(schedule)) return schedule

  return schedule.map((day) => {
    if (!Array.isArray(day)) return day

    return day.map((slot) => {
      if (!slot || typeof slot !== 'object') return slot
      if (!slot.value || typeof slot.value === 'string' && slot.value.startsWith('ext:')) return slot
      if (slot.schedule_kind === 'internship') {
        return {
          value: null,
          room_id: null,
          type: null,
          schedule_kind: 'internship',
          section_ids: [],
          teacher_ids: []
        }
      }
      if (!isTeacherScheduleHiddenSubject(slot.value)) return slot

      return {
        value: null,
        room_id: null,
        type: null,
        section_ids: [],
        teacher_ids: []
      }
    })
  })
}

export const clearTeacherScheduleVisibilityCache = (subjectId = null) => {
  if (subjectId === null || subjectId === undefined) {
    hiddenCache.clear()
    return
  }

  hiddenCache.delete(Number(subjectId))
}
