import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id // teacher id
  const body = await readBody(event) // request body

  const stmt = db.prepare('UPDATE teachers SET name = ? WHERE id_teacher = ?')
  const result = stmt.run(body.name, id)
  return { changes: result.changes }
})
