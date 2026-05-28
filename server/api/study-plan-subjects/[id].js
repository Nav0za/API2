import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)
    const year = body.year !== undefined ? body.year : 1
    const semester = body.semester !== undefined ? body.semester : 1
    const theory_hours = Number(body.theory_hours) || 0
    const practical_hours = Number(body.practical_hours) || 0

    const stmt = db.prepare('UPDATE study_plan_subjects SET year = ?, semester = ?, theory_hours = ?, practical_hours = ? WHERE id_plan_subject = ?')
    const result = stmt.run(year, semester, theory_hours, practical_hours, id)
    
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Study Plan Subject not found' })
    }
    return { success: true }
  }

  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM study_plan_subjects WHERE id_plan_subject = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Study Plan Subject not found' })
    }
    return { success: true }
  }
})
