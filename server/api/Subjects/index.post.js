import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        if (!body.name_subject) {
            throw createError({
                statusCode: 400,
                statusMessage: 'name subject is required'
            })
        }
        const stmt = db.prepare('INSERT INTO Teachers (name_teacher) VALUES (?)')
        const result = stmt.run(body.name_subject)
        return {
            id_subject: result.lastInsertRowid,
            name_subject: body.name_subject,
            status: 1
        }
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
			throw createError({
				statusCode: 409,
				statusMessage: 'Name already exists'
			})
        }
        throw error
    }
})