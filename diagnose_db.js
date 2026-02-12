import Database from 'better-sqlite3'
import { resolve } from 'path'

const dbPath = resolve('./server/data/data.db')
const db = new Database(dbPath)

console.log('--- TEACHER 4 TERM 2/69 ---')
const s = db.prepare('SELECT * FROM schedules WHERE id_teacher = 4 AND term = ?').get('2/69')
if (s) {
    console.log(`ID: ${s.id_schedule}, Teacher: ${s.id_teacher}, Term: ${s.term}`)
    console.log(`Data: ${s.scheduleData}`)
} else {
    console.log('Not found')
}
