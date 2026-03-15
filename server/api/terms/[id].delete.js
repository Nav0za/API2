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
    const startDate = termRow.start_date
    const endDate = termRow.end_date

    // 1. Get IDs before deletion so we know what to clean up
    const teacherIdsInTerm = db.prepare('SELECT DISTINCT id_teacher FROM schedules WHERE term = ?').all(termStr).map(r => r.id_teacher)
    const sectionIdsInTerm = db.prepare('SELECT id_section FROM sections WHERE term = ?').all(termStr).map(r => r.id_section)

    // 2. Identify and Delete makeup_classes AND their associated Calendar Events
    const combinedMakeupIds = []
    
    if (teacherIdsInTerm.length > 0) {
      const ph = teacherIdsInTerm.map(() => '?').join(',')
      const ids = db.prepare(`SELECT id_makeup FROM makeup_classes WHERE teacher_id IN (${ph})`).all(...teacherIdsInTerm).map(r => r.id_makeup)
      combinedMakeupIds.push(...ids)
    }
    
    if (sectionIdsInTerm.length > 0) {
      const ph = sectionIdsInTerm.map(() => '?').join(',')
      const ids = db.prepare(`SELECT id_makeup FROM makeup_classes WHERE section_id IN (${ph})`).all(...sectionIdsInTerm).map(r => r.id_makeup)
      combinedMakeupIds.push(...ids)
    }

    const uniqueMakeupIds = [...new Set(combinedMakeupIds)]

    if (uniqueMakeupIds.length > 0) {
       // Delete calendar events linked to these makeups
       for (const mid of uniqueMakeupIds) {
         db.prepare("DELETE FROM calendar_events WHERE event_type = 'makeup_class' AND makeup_class_ids = ?").run(`[${mid}]`)
       }
       
       // Delete the makeup classes themselves
       const ph = uniqueMakeupIds.map(() => '?').join(',')
       db.prepare(`DELETE FROM makeup_classes WHERE id_makeup IN (${ph})`).run(...uniqueMakeupIds)
    }

    // 3. Delete external_subjects explicitly for this term
    db.prepare('DELETE FROM external_subjects WHERE term = ?').run(termStr)

    // 4. Delete section_schedules 
    db.prepare('DELETE FROM section_schedules WHERE term = ?').run(termStr)

    // 5. Delete sections (this will CASCADE to SubjectSections automatically via DB ForeignKey)
    db.prepare('DELETE FROM sections WHERE term = ?').run(termStr)

    // 6. Delete schedules (teacher timetables)
    db.prepare('DELETE FROM schedules WHERE term = ?').run(termStr)

    // 7. Delete calendar_events linked to teachers in this term OR within the date range
    // 7a. First delete by teacher IDs (Handles absences, etc.)
    if (teacherIdsInTerm.length > 0) {
      const ph = teacherIdsInTerm.map(() => '?').join(',')
      db.prepare(`DELETE FROM calendar_events WHERE teacher_id IN (${ph})`).run(...teacherIdsInTerm)
    }

    // 7b. Then delete by date range for anything else (Holidays are dynamic, so this targets other normal events)
    if (startDate && endDate) {
      db.prepare(`
        DELETE FROM calendar_events 
        WHERE date(start) >= date(?) AND date(start) <= date(?)
      `).run(startDate, endDate)
    }

    // 8. Delete the term itself
    db.prepare('DELETE FROM terms WHERE id_term = ?').run(id)

    // --- Cleanup Orphans (Subjects, Teachers, Rooms) ---
    // Only delete them if they are no longer associated with any remaining terms!

    // A. Delete orphaned Subjects (ones that no longer have any sections mapped to them)
    db.prepare(`
      DELETE FROM Subjects 
      WHERE id_subject NOT IN (SELECT DISTINCT id_subject FROM SubjectSections)
    `).run()

    // B. Delete orphaned Teachers (ones that no longer have any schedules anywhere)
    db.prepare(`
      DELETE FROM teachers 
      WHERE id_teacher NOT IN (SELECT DISTINCT id_teacher FROM schedules)
    `).run()

    // C. Delete orphaned Rooms (ones no longer used in any remaining schedules or makeup classes)
    const allRemainingSchedules = db.prepare('SELECT scheduleData FROM schedules').all()
    const usedRoomIds = new Set()

    allRemainingSchedules.forEach(s => {
      try {
        if (!s.scheduleData) return
        const parsed = JSON.parse(s.scheduleData)
        for (const day of parsed) {
          if (!Array.isArray(day)) continue
          for (const slot of day) {
            if (slot && slot.room_id) {
              usedRoomIds.add(Number(slot.room_id))
            }
          }
        }
      } catch (e) {}
    })

    const makeupRooms = db.prepare('SELECT DISTINCT room_id FROM makeup_classes WHERE room_id IS NOT NULL').all()
    makeupRooms.forEach(r => usedRoomIds.add(Number(r.room_id)))

    if (usedRoomIds.size > 0) {
      const usedIdsArray = Array.from(usedRoomIds)
      const ph = usedIdsArray.map(() => '?').join(',')
      db.prepare(`DELETE FROM rooms WHERE id_room NOT IN (${ph})`).run(...usedIdsArray)
    } else {
      // If absolutely no rooms are used anywhere in the DB anymore, wipe them all
      db.prepare('DELETE FROM rooms').run()
    }
  })

  cascadeDelete()

  return {
    message: `Term ${termStr} and all related data deleted successfully`,
    id_term: id,
    term: termStr
  }
})
