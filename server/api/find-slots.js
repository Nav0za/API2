import { findAvailableSlots } from '../utils/autoSchedule.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { teacher_id, missed_date, term } = query

  // Validate
  if (!teacher_id || !missed_date || !term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'teacher_id, missed_date, and term are required'
    })
  }

  try {
    const slots = await findAvailableSlots(
      parseInt(teacher_id),
      missed_date,
      term
    )

    return {
      success: true,
      missedDate: missed_date,
      teacherId: teacher_id,
      term,
      suggestions: slots
    }
  } catch (error) {
    console.error('Error finding slots:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to find available slots'
    })
  }
})
