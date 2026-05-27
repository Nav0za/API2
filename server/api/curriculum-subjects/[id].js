import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)
    if (!body.name_subject || !body.id_category) {
      throw createError({ statusCode: 400, statusMessage: 'name_subject and id_category are required' })
    }

    const credit = Number(body.credit) || 0

    const stmt = db.prepare('UPDATE curriculum_subjects SET name_subject = ?, subject_code = ?, id_category = ?, credit = ? WHERE id_subject_curr = ?')
    const result = stmt.run(body.name_subject, body.subject_code || null, body.id_category, credit, id)
    
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
    }
    return { success: true }
  }

  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM curriculum_subjects WHERE id_subject_curr = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Subject not found' })
    }
    return { success: true }
  }
})
