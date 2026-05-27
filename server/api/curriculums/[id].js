import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)
    if (!body.name_curriculum) {
      throw createError({ statusCode: 400, statusMessage: 'name_curriculum is required' })
    }

    try {
      const stmt = db.prepare('UPDATE curriculums SET name_curriculum = ?, description = ? WHERE id_curriculum = ?')
      const result = stmt.run(body.name_curriculum, body.description || null, id)
      
      if (result.changes === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Curriculum not found' })
      }
      return { success: true }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError({ statusCode: 409, statusMessage: 'Curriculum name already exists' })
      }
      throw error
    }
  }

  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM curriculums WHERE id_curriculum = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Curriculum not found' })
    }
    return { success: true }
  }
})
