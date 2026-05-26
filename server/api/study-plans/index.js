import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    if (query.id_curriculum) {
      return db.prepare('SELECT * FROM study_plans WHERE id_curriculum = ? ORDER BY year ASC, semester ASC').all(query.id_curriculum)
    }
    return db.prepare('SELECT * FROM study_plans ORDER BY id_curriculum ASC, year ASC, semester ASC').all()
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    if (!body.id_curriculum || !body.name_plan || !body.level || !body.year || !body.semester) {
      throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
    }

    const stmt = db.prepare('INSERT INTO study_plans (id_curriculum, name_plan, level, year, semester) VALUES (?, ?, ?, ?, ?)')
    const result = stmt.run(body.id_curriculum, body.name_plan, body.level, body.year, body.semester)
    return {
      id_plan: result.lastInsertRowid,
      id_curriculum: body.id_curriculum,
      name_plan: body.name_plan,
      level: body.level,
      year: body.year,
      semester: body.semester
    }
  }
})
