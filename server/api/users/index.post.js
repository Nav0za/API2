import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body.username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username is required'
      })
    }
    const stmt = db.prepare('INSERT INTO users (username) VALUES (?)')
    const result = stmt.run(body.username)
    return {
      id: result.lastInsertRowid,
      username: body.username
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists'
      })
    }
    throw error
  }
})
