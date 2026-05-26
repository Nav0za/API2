import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)
    if (!body.name_plan || !body.level || !body.year || !body.semester) {
      throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
    }

    const stmt = db.prepare('UPDATE study_plans SET name_plan = ?, level = ?, year = ?, semester = ? WHERE id_plan = ?')
    const result = stmt.run(body.name_plan, body.level, body.year, body.semester, id)
    
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Study Plan not found' })
    }
    return { success: true }
  }

  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM study_plans WHERE id_plan = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Study Plan not found' })
    }
    return { success: true }
  }
})
