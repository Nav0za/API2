import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id // teacher id
  const body = await readBody(event) // request body
  const { prefix, first_name, last_name } = body

  if (!first_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'First name is required'
    })
  }

  const fullName = [prefix, first_name, last_name].filter(Boolean).join(' ').trim()

  const stmt = db.prepare('UPDATE teachers SET name = ?, prefix = ?, first_name = ?, last_name = ? WHERE id_teacher = ?')
  const result = stmt.run(fullName, prefix || '', first_name, last_name || '', id)
  return { changes: result.changes }
})
