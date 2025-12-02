import db from '../../utils/db.js'

export default defineEventHandler(() => {
    const stmt = db.prepare('SELECT * FROM Subjects')
    const subjects = stmt.all()
    return subjects
})