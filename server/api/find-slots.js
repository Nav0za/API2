import { findAvailableSlots, findAvailableSlotsForMultipleClasses } from '../utils/autoSchedule.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { teacher_id, missed_date, term, classes } = query

  // Validate
  if (!teacher_id || !missed_date || !term) {
    throw createError({
      statusCode: 400,
      statusMessage: 'teacher_id, missed_date, and term are required'
    })
  }

  if (missed_date === 'undefined' || missed_date === 'null' || isNaN(new Date(missed_date).getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid missed_date format'
    })
  }

  try {
    let slots

    // ถ้ามี classes parameter แปลว่าต้องการหาช่วงว่างสำหรับหลายวิชาพร้อมกัน
    if (classes) {
      const selectedClasses = JSON.parse(classes)
      if (selectedClasses.length === 0) {
        return {
          success: true,
          missedDate: missed_date,
          teacherId: teacher_id,
          term,
          suggestions: []
        }
      }
      slots = await findAvailableSlotsForMultipleClasses(
        parseInt(teacher_id),
        missed_date,
        term,
        selectedClasses
      )
    } else {
      // ใช้ logic เดิม (หาช่วงว่างแยกตามวิชา)
      slots = await findAvailableSlots(
        parseInt(teacher_id),
        missed_date,
        term
      )
    }

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
