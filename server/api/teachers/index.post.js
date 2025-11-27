import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event)
		if (!body.name) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Name is required'
			})
		}
		const stmt = db.prepare('INSERT INTO teachers (name) VALUES (?)')
		const result = stmt.run(body.name)
		return {
			id_teacher: result.lastInsertRowid,
			name: body.name,
			status: 1
		}
	} catch (error) {
		if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			throw createError({
				statusCode: 409,
				statusMessage: 'Name already exists'
			})
		}
		throw error
	}
})
