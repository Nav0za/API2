import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const jsonString = JSON.stringify(body.schedule)

    const stmt = db.prepare('INSERT INTO schedule (schedule) VALUES (?)')
    const res = stmt.run(jsonString)
    return { id: res.lastInsertRowid, schedule: jsonString }
})
