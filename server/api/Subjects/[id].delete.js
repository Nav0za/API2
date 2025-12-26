import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const stmt = db.prepare('DELETE FROM Subjects WHERE id_subject = ?')
  const result = stmt.run(id)
  return { deleted: result.changes > 0 }
})
