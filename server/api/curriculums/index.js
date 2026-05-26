import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    return db.prepare('SELECT * FROM curriculums ORDER BY created_at DESC').all()
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    if (!body.name_curriculum) {
      throw createError({ statusCode: 400, statusMessage: 'name_curriculum is required' })
    }

    try {
      const stmt = db.prepare('INSERT INTO curriculums (name_curriculum, description) VALUES (?, ?)')
      const result = stmt.run(body.name_curriculum, body.description || null)
      return {
        id_curriculum: result.lastInsertRowid,
        name_curriculum: body.name_curriculum,
        description: body.description || null
      }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError({ statusCode: 409, statusMessage: 'Curriculum name already exists' })
      }
      throw error
    }
  }
})
