import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const id = event.context.params.id
    const body = await readBody(event)
    const stmt = await db.prepare('UPDATE users SET username = ? WHERE id = ?')
    const result = await stmt.run(body.username, id)
    return { changes: result.changes }
})