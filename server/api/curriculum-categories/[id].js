import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)
    if (!body.name_category) {
      throw createError({ statusCode: 400, statusMessage: 'name_category is required' })
    }

    const stmt = db.prepare('UPDATE curriculum_categories SET name_category = ?, parent_id = ? WHERE id_category = ?')
    const result = stmt.run(body.name_category, body.parent_id || null, id)
    
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    return { success: true }
  }

  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM curriculum_categories WHERE id_category = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    return { success: true }
  }
})
