import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    if (query.id_curriculum) {
      return db.prepare('SELECT * FROM study_plans WHERE id_curriculum = ? ORDER BY created_at DESC').all(query.id_curriculum)
    }
    return db.prepare('SELECT * FROM study_plans ORDER BY id_curriculum ASC, created_at DESC').all()
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    if (!body.id_curriculum || !body.name_plan || !body.level) {
      throw createError({ statusCode: 400, statusMessage: 'Curriculum ID, name, and level are required' })
    }
    const stmt = db.prepare('INSERT INTO study_plans (id_curriculum, name_plan, level) VALUES (?, ?, ?)')
    const result = stmt.run(body.id_curriculum, body.name_plan, body.level)
    return {
      id_plan: result.lastInsertRowid,
      id_curriculum: body.id_curriculum,
      name_plan: body.name_plan,
      level: body.level
    }
  }
})
