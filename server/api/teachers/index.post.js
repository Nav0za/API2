import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { prefix, first_name, last_name } = body

    if (!first_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'First name is required'
      })
    }

    // Construct full name for response
    const fullName = [prefix, first_name, last_name].filter(Boolean).join(' ').trim()

    const stmt = db.prepare('INSERT INTO teachers (prefix, first_name, last_name) VALUES (?, ?, ?)')
    const result = stmt.run(prefix || '', first_name, last_name || '')

    return {
      id_teacher: result.lastInsertRowid,
      name: fullName,
      prefix,
      first_name,
      last_name,
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
