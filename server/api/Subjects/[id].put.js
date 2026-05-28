import db from '../../utils/db.js'
import { clearTeacherScheduleVisibilityCache } from '../../utils/teacherScheduleVisibility.js'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const body = await readBody(event)

  const subjectId = Number(id)
  const existing = db.prepare('SELECT * FROM Subjects WHERE id_subject = ?').get(subjectId)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Subject not found'
    })
  }

  const nextCurriculumSubjectId = body.curriculum_subject_id !== undefined
    ? (body.curriculum_subject_id || null)
    : (existing.curriculum_subject_id || null)

  if (!nextCurriculumSubjectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'curriculum_subject_id is required'
    })
  }

  const teacherProvided = Object.prototype.hasOwnProperty.call(body, 'id_teacher')
  const externalProvided = Object.prototype.hasOwnProperty.call(body, 'external_teacher_name')
  const nextTeacherId = teacherProvided ? (body.id_teacher || null) : existing.id_teacher
  const nextExternalTeacherName = nextTeacherId
    ? null
    : (externalProvided ? (body.external_teacher_name || null) : existing.external_teacher_name)
  const nextPlanSubjectId = Object.prototype.hasOwnProperty.call(body, 'id_plan_subject')
    ? (body.id_plan_subject || null)
    : existing.id_plan_subject
  const nextCurriculumSubject = db.prepare('SELECT subject_code, name_subject FROM curriculum_subjects WHERE id_subject_curr = ?').get(nextCurriculumSubjectId)
  const inferredHideInTeacherSchedule = body.hide_in_teacher_schedule !== undefined
    ? (body.hide_in_teacher_schedule ? 1 : 0)
    : (/ฝึกงาน/.test(nextCurriculumSubject?.name_subject || '') ? 1 : 0)

  // 1. Update subject main fields
  const stmt = db.prepare(`
    UPDATE Subjects
    SET curriculum_subject_id = ?,
        id_plan_subject = ?,
        id_teacher = ?,
        external_teacher_name = ?,
        hide_in_teacher_schedule = ?
    WHERE id_subject = ?
  `)
  stmt.run(
    nextCurriculumSubjectId,
    nextPlanSubjectId,
    nextTeacherId,
    nextExternalTeacherName,
    inferredHideInTeacherSchedule,
    subjectId
  )
  clearTeacherScheduleVisibilityCache(subjectId)

  // Update Sections if provided
  if (body.id_sections && Array.isArray(body.id_sections)) {
    // 1. Delete old associations
    db.prepare('DELETE FROM SubjectSections WHERE id_subject = ?').run(subjectId)

    // 2. Insert new associations
    const insertSection = db.prepare('INSERT INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
    const transaction = db.transaction((sections) => {
      for (const sectionId of sections) {
        insertSection.run(subjectId, sectionId)
      }
    })
    transaction(body.id_sections)
  }

  return { success: true }
})
