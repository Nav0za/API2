import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    if (query.id_curriculum) {
      return db.prepare(`
        SELECT cs.* 
        FROM curriculum_subjects cs
        JOIN curriculum_categories cc ON cs.id_category = cc.id_category
        WHERE cc.id_curriculum = ?
        ORDER BY cs.subject_code ASC
      `).all(query.id_curriculum)
    }
    return db.prepare('SELECT * FROM curriculum_subjects ORDER BY subject_code ASC').all()
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    if (!body.id_category || !body.name_subject) {
      throw createError({ statusCode: 400, statusMessage: 'id_category and name_subject are required' })
    }

    const credit = Number(body.credit) || 0

    const stmt = db.prepare('INSERT INTO curriculum_subjects (id_category, subject_code, name_subject, credit) VALUES (?, ?, ?, ?)')
    const result = stmt.run(body.id_category, body.subject_code || null, body.name_subject, credit)
    return {
      id_subject_curr: result.lastInsertRowid,
      id_category: body.id_category,
      subject_code: body.subject_code || null,
      name_subject: body.name_subject,
      credit
    }
  }
})
