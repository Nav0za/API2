import db from '../../utils/db';

export default defineEventHandler(async (event) => {
    const stmt = db.prepare('SELECT * FROM schedule ORDER BY scheduleId')
    const schedules = stmt.all()
    return schedules
})