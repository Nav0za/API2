import db from '../../utils/db.js'
import { getSectionSubjectHoursUsed } from '../../utils/hoursCalculation.js'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const { id_subject, id_section, term } = query

  if (!id_subject || !id_section || !term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'id_subject, id_section, and term are required'
    })
  }

  // Find the subject to get the id_plan_subject and limits
  const subject = db.prepare(`
    SELECT s.id_plan_subject, sps.theory_hours, sps.practical_hours
    FROM Subjects s
    LEFT JOIN study_plan_subjects sps ON s.id_plan_subject = sps.id_plan_subject
    WHERE s.id_subject = ?
  `).get(id_subject)

  if (!subject) {
    throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
  }

  const theoryLimit = subject.theory_hours || 0
  const practicalLimit = subject.practical_hours || 0

  const usage = getSectionSubjectHoursUsed(id_section, term)
  const subjUsage = usage[id_subject] || { theory: 0, practical: 0, unknown: 0 }

  return {
    id_subject: Number(id_subject),
    theory_hours_limit: theoryLimit,
    practical_hours_limit: practicalLimit,
    theory_hours_used: subjUsage.theory,
    practical_hours_used: subjUsage.practical,
    theory_hours_remaining: Math.max(0, theoryLimit - subjUsage.theory),
    practical_hours_remaining: Math.max(0, practicalLimit - subjUsage.practical)
  }
})
