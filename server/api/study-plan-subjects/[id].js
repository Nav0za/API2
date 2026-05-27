import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM study_plan_subjects WHERE id_plan_subject = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Study Plan Subject not found' })
    }
    return { success: true }
  }
})
