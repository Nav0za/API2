import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // curriculum_subject_id is now strictly required as the sole name source
    if (!body.curriculum_subject_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'curriculum_subject_id is required'
      })
    }
    if (!body.id_sections || body.id_sections.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sections are required'
      })
    }

    // Resolve name for the response payload to keep frontend happy
    let resolvedName = 'Unknown'
    const cs = db.prepare('SELECT subject_code, name_subject FROM curriculum_subjects WHERE id_subject_curr = ?').get(body.curriculum_subject_id)
    if (cs) {
      resolvedName = cs.subject_code ? `${cs.subject_code} ${cs.name_subject}` : cs.name_subject
    }

    // 1. Insert Subject (name_subject column is removed)
    const stmt = db.prepare('INSERT INTO Subjects (id_teacher, term, curriculum_subject_id) VALUES (?, ?, ?)')
    const result = stmt.run(body.id_teacher, body.term || null, body.curriculum_subject_id)
    const subjectId = result.lastInsertRowid

    // 2. Insert SubjectSections (Join table)
    const insertSection = db.prepare('INSERT INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
    const transaction = db.transaction((sections) => {
      for (const sectionId of sections) {
        insertSection.run(subjectId, sectionId)
      }
    })
    transaction(body.id_sections)

    return {
      id_subject: subjectId,
      name_subject: resolvedName,
      id_sections: body.id_sections,
      status: 1
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Subject constraint error'
      })
    }
    throw error
  }
})
