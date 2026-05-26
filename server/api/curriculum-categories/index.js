import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    if (query.id_curriculum) {
      return db.prepare('SELECT * FROM curriculum_categories WHERE id_curriculum = ? ORDER BY id_category ASC').all(query.id_curriculum)
    }
    return db.prepare('SELECT * FROM curriculum_categories ORDER BY id_category ASC').all()
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    if (!body.id_curriculum || !body.name_category) {
      throw createError({ statusCode: 400, statusMessage: 'id_curriculum and name_category are required' })
    }

    const stmt = db.prepare('INSERT INTO curriculum_categories (id_curriculum, parent_id, name_category) VALUES (?, ?, ?)')
    const result = stmt.run(body.id_curriculum, body.parent_id || null, body.name_category)
    return {
      id_category: result.lastInsertRowid,
      id_curriculum: body.id_curriculum,
      parent_id: body.parent_id || null,
      name_category: body.name_category
    }
  }
})
