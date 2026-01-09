import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid term id'
    })
  }

  const stmt = db.prepare('DELETE FROM terms WHERE id_term = ?')
  const result = stmt.run(id)

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Term not found'
    })
  }

  return {
    message: 'Term deleted successfully',
    id_term: id
  }
})
