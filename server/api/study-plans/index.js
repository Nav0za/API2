import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    let stmt;
    if (query.id_curriculum) {
      stmt = db.prepare(`
        SELECT p.*, c.name_curriculum 
        FROM study_plans p
        LEFT JOIN curriculums c ON p.id_curriculum = c.id_curriculum
        WHERE p.id_curriculum = ? 
        ORDER BY p.created_at DESC
      `)
      return stmt.all(query.id_curriculum)
    }
    stmt = db.prepare(`
      SELECT p.*, c.name_curriculum 
      FROM study_plans p
      LEFT JOIN curriculums c ON p.id_curriculum = c.id_curriculum
      ORDER BY p.id_curriculum ASC, p.created_at DESC
    `)
    return stmt.all()
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
