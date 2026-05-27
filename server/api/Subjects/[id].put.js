import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const body = await readBody(event)

  const newCurrId = body.curriculum_subject_id || null

  if (!newCurrId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'curriculum_subject_id is required'
    })
  }

  // 1. Update Subject curriculum link (name_subject column is removed)
  const stmt = db.prepare('UPDATE Subjects SET curriculum_subject_id = ? WHERE id_subject = ?')
  stmt.run(newCurrId, id)

  // Update Sections if provided
  if (body.id_sections && Array.isArray(body.id_sections)) {
    // 1. Delete old associations
    db.prepare('DELETE FROM SubjectSections WHERE id_subject = ?').run(id)

    // 2. Insert new associations
    const insertSection = db.prepare('INSERT INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
    const transaction = db.transaction((sections) => {
      for (const sectionId of sections) {
        insertSection.run(id, sectionId)
      }
    })
    transaction(body.id_sections)
  }

  return { success: true }
})
