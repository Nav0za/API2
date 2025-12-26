import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params // ดึง id จากพารามิเตอร์ของ URL
  const stmt = db.prepare('DELETE FROM teachers WHERE id_teacher = ?')
  const result = stmt.run(id)
  return { deleted: result.changes > 0 }
})
