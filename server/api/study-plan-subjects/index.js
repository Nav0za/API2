import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  if (event.node.req.method === 'GET') {
    const query = getQuery(event)
    if (query.id_plan) {
      return db.prepare(`
        SELECT sps.*, cs.subject_code, cs.name_subject, cs.credit, cc.name_category
        FROM study_plan_subjects sps
        JOIN curriculum_subjects cs ON sps.id_subject_curr = cs.id_subject_curr
        LEFT JOIN curriculum_categories cc ON cs.id_category = cc.id_category
        WHERE sps.id_plan = ?
        ORDER BY sps.year ASC, sps.semester ASC, cc.id_category ASC, cs.subject_code ASC
      `).all(query.id_plan)
    }
    return []
  }

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    if (!body.id_plan || !body.id_subject_curr) {
      throw createError({ statusCode: 400, statusMessage: 'id_plan and id_subject_curr are required' })
    }
    const year = body.year || 1
    const semester = body.semester || 1
    const theory_hours = Number(body.theory_hours) || 0
    const practical_hours = Number(body.practical_hours) || 0

    try {
      const stmt = db.prepare('INSERT INTO study_plan_subjects (id_plan, id_subject_curr, year, semester, theory_hours, practical_hours) VALUES (?, ?, ?, ?, ?, ?)')
      const result = stmt.run(body.id_plan, body.id_subject_curr, year, semester, theory_hours, practical_hours)
      
      // Fetch details back
      const inserted = db.prepare(`
        SELECT sps.*, cs.subject_code, cs.name_subject
        FROM study_plan_subjects sps
        JOIN curriculum_subjects cs ON sps.id_subject_curr = cs.id_subject_curr
        WHERE sps.id_plan_subject = ?
      `).get(result.lastInsertRowid)

      return inserted
    } catch (error) {
       if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError({ statusCode: 409, statusMessage: 'Subject already exists in this plan' })
      }
      throw error
    }
  }
})
