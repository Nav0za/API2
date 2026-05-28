import db from '../../utils/db.js'
import { getSectionSubjectHoursUsed } from '../../utils/hoursCalculation.js'

const resolveSubjectRow = ({ id_subject, subject_key }) => {
  if (subject_key) {
    return db.prepare(`
      SELECT s.id_subject, s.id_plan_subject, s.curriculum_subject_id, cs.name_subject, sps.theory_hours, sps.practical_hours
      FROM Subjects s
      LEFT JOIN curriculum_subjects cs ON s.curriculum_subject_id = cs.id_subject_curr
      LEFT JOIN study_plan_subjects sps ON s.id_plan_subject = sps.id_plan_subject
      WHERE s.id_plan_subject = ? OR s.curriculum_subject_id = ?
      ORDER BY
        CASE
          WHEN s.id_plan_subject = ? THEN 0
          WHEN s.curriculum_subject_id = ? THEN 1
          ELSE 2
        END,
        s.id_subject ASC
      LIMIT 1
    `).get(subject_key, subject_key, subject_key, subject_key)
  }

  return db.prepare(`
    SELECT s.id_subject, s.id_plan_subject, s.curriculum_subject_id, cs.name_subject, sps.theory_hours, sps.practical_hours
    FROM Subjects s
    LEFT JOIN curriculum_subjects cs ON s.curriculum_subject_id = cs.id_subject_curr
    LEFT JOIN study_plan_subjects sps ON s.id_plan_subject = sps.id_plan_subject
    WHERE s.id_subject = ?
  `).get(id_subject)
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const { id_subject, subject_key, id_section, term } = query

  if (!id_section || !term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id_section and term are required'
    })
  }

  if (!id_subject && !subject_key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id_subject or subject_key is required'
    })
  }

  const subject = resolveSubjectRow({ id_subject, subject_key })

  if (!subject) {
    throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
  }

  const usage = getSectionSubjectHoursUsed(id_section, term)
  const baseKey = String(subject.id_plan_subject || subject.curriculum_subject_id || id_subject)
  const subjUsage = usage[baseKey] || { theory: 0, practical: 0, unknown: 0 }

  const theoryLimit = Number(subject.theory_hours || 0)
  const practicalLimit = Number(subject.practical_hours || 0)

  return {
    id_subject: Number(subject.id_subject || id_subject),
    subject_name: subject.name_subject || '',
    theory_hours_limit: theoryLimit,
    practical_hours_limit: practicalLimit,
    theory_hours_used: subjUsage.theory,
    practical_hours_used: subjUsage.practical,
    theory_hours_remaining: Math.max(0, theoryLimit - subjUsage.theory),
    practical_hours_remaining: Math.max(0, practicalLimit - subjUsage.practical)
  }
})
