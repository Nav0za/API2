import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)
    if (!body.name_plan || !body.level) {
      throw createError({ statusCode: 400, statusMessage: 'Name and level are required' })
    }
    const stmt = db.prepare('UPDATE study_plans SET name_plan = ?, level = ? WHERE id_plan = ?')
    const result = stmt.run(body.name_plan, body.level, id)
    
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
