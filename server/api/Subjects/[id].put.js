import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params
    const body = await readBody(event)

    // Validate input
    if (!body.name_subject || body.name_subject.trim() === '') {
        throw createError({
            statusCode: 400,
            statusMessage: 'name_subject is required'
        })
    }

    const stmt = db.prepare('UPDATE Subjects SET name_subject = ? WHERE id_subject = ?')
    const result = stmt.run(body.name_subject, id)
    return { changes: result.changes }
})