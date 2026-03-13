import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid term id'
    })
  }

  // Get the term info first to know the term string (e.g. "1/2569")
  const termRow = db.prepare('SELECT term, academic_year, start_date, end_date FROM terms WHERE id_term = ?').get(id)

  if (!termRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Term not found'
    })
  }

  const termStr = `${termRow.term}/${termRow.academic_year}`

  const cascadeDelete = db.transaction(() => {
    // 0. Extract dates to delete calendar events
    const startDate = termRow.start_date
    const endDate = termRow.end_date

    // Delete calendar_events that fall within the term date range
    if (startDate && endDate) {
      db.prepare(`
        DELETE FROM calendar_events 
        WHERE start >= ? AND start <= ?
      `).run(startDate, endDate)
    }

    // Delete external_subjects for this term
    db.prepare('DELETE FROM external_subjects WHERE term = ?').run(termStr)

    // 1. Delete makeup_classes that belong to subjects in this term
    //    (via schedules linked to this term's teachers/sections)
    //    Also delete directly by querying schedules for teacher_ids in this term
    const teacherIds = db.prepare('SELECT DISTINCT id_teacher FROM schedules WHERE term = ?').all(termStr).map(r => r.id_teacher)
    const sectionIds = db.prepare('SELECT id_section FROM sections WHERE term = ?').all(termStr).map(r => r.id_section)

    // Delete makeup classes tied to teacher/section of this term
    if (teacherIds.length > 0) {
      const placeholders = teacherIds.map(() => '?').join(',')
      db.prepare(`DELETE FROM makeup_classes WHERE teacher_id IN (${placeholders})`).run(...teacherIds)
    }

    // 2. Delete section_schedules for sections in this term
    if (sectionIds.length > 0) {
      const placeholders = sectionIds.map(() => '?').join(',')
      db.prepare(`DELETE FROM section_schedules WHERE id_section IN (${placeholders})`).run(...sectionIds)
    }

    // 3. Delete sections in this term
    db.prepare('DELETE FROM sections WHERE term = ?').run(termStr)

    // 4. Delete subjects in this term
    db.prepare('DELETE FROM Subjects WHERE term = ?').run(termStr)

    // 5. Delete schedules (teacher timetables) for this term
    db.prepare('DELETE FROM schedules WHERE term = ?').run(termStr)

    // 6. Delete Teachers if they don't have any schedules or subjects left in other terms
    if (teacherIds.length > 0) {
      // Find teachers who still have other references
      const remainingTeachersInSubjects = db.prepare(`SELECT DISTINCT id_teacher FROM Subjects`).all().map(r => r.id_teacher)
      const remainingTeachersInSchedules = db.prepare(`SELECT DISTINCT id_teacher FROM schedules`).all().map(r => r.id_teacher)
      const remainingTeachersInEvents = db.prepare(`SELECT DISTINCT teacher_id FROM calendar_events`).all().map(r => r.teacher_id)
      const remainingTeachersInMakeup = db.prepare(`SELECT DISTINCT teacher_id FROM makeup_classes`).all().map(r => r.teacher_id)
      
      const allActiveTeacherIds = new Set([
        ...remainingTeachersInSubjects, 
        ...remainingTeachersInSchedules, 
        ...remainingTeachersInEvents,
        ...remainingTeachersInMakeup
      ])

      const teachersToDelete = teacherIds.filter(id => id !== null && !allActiveTeacherIds.has(id))
      
      if (teachersToDelete.length > 0) {
         const placeholders = teachersToDelete.map(() => '?').join(',')
         db.prepare(`DELETE FROM teachers WHERE id_teacher IN (${placeholders})`).run(...teachersToDelete)
      }
    }

    // 7. Delete Rooms if they don't have any subjects left in other terms
    // Get distinct rooms used in all subjects (that are left)
    const activeRooms = db.prepare(`SELECT DISTINCT id_room FROM Subjects WHERE id_room IS NOT NULL`).all().map(r => r.id_room)
    const allRooms = db.prepare(`SELECT id_room FROM rooms`).all().map(r => r.id_room)
    
    // Also check makeup classes for used rooms
    const makeupRooms = db.prepare(`SELECT DISTINCT room_id FROM makeup_classes WHERE room_id IS NOT NULL`).all().map(r => r.room_id)
    const allActiveRoomIds = new Set([...activeRooms, ...makeupRooms])
    
    const roomsToDelete = allRooms.filter(id => !allActiveRoomIds.has(id))
    
    if (roomsToDelete.length > 0) {
      const placeholders = roomsToDelete.map(() => '?').join(',')
      db.prepare(`DELETE FROM rooms WHERE id_room IN (${placeholders})`).run(...roomsToDelete)
    }

    // 8. Finally, delete the term itself
    db.prepare('DELETE FROM terms WHERE id_term = ?').run(id)
  })

  cascadeDelete()

  return {
    message: `Term ${termStr} and all related data deleted successfully`,
    id_term: id,
    term: termStr
  }
})
