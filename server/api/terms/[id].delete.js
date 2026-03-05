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
  const termRow = db.prepare('SELECT term, academic_year FROM terms WHERE id_term = ?').get(id)

  if (!termRow) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Term not found'
    })
  }

  const termStr = `${termRow.term}/${termRow.academic_year}`

  // Cascade delete all related data for this term
  const cascadeDelete = db.transaction(() => {
    // 1. Delete makeup_classes that belong to subjects in this term
    //    (via schedules linked to this term's teachers/sections)
    //    Also delete directly by querying schedules for teacher_ids in this term
    const teacherIds = db.prepare('SELECT id_teacher FROM schedules WHERE term = ?').all(termStr).map(r => r.id_teacher)
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

    // 6. Finally, delete the term itself
    db.prepare('DELETE FROM terms WHERE id_term = ?').run(id)
  })

  cascadeDelete()

  return {
    message: `Term ${termStr} and all related data deleted successfully`,
    id_term: id,
    term: termStr
  }
})
