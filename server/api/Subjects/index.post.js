import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body.name_subject || !body.id_sections || body.id_sections.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'name subject and sections are required'
      })
    }

    // 1. Insert Subject
    const stmt = db.prepare('INSERT INTO Subjects (name_subject, id_teacher, id_room) VALUES (?, ?, ?)')
    const result = stmt.run(body.name_subject, body.id_teacher, body.id_room || null)
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
      name_subject: body.name_subject,
      id_room: body.id_room || null,
      id_sections: body.id_sections,
      status: 1
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Name already exists'
      })
    }
    throw error
  }
})
