import db from '../../utils/db.js'

export default defineEventHandler(() => {
    const stmt = db.prepare('SELECT * FROM teachers')
    const teachers = stmt.all()
    return teachers
})
