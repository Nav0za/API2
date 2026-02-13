import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body.name_subject || !body.id_section) {
      throw createError({
        statusCode: 400,
        statusMessage: 'name subject and section are required'
      })
    }
    const stmt = db.prepare('INSERT INTO Subjects (name_subject, id_teacher, id_section) VALUES (?, ?, ?)')
    const result = stmt.run(body.name_subject, body.id_teacher, body.id_section)
    return {
      id_subject: result.lastInsertRowid,
      name_subject: body.name_subject,
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
