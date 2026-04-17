import Database from 'better-sqlite3'
const db = new Database('./server/data/data.db')

console.log('Tables and Row Counts:')
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()

tables.forEach(t => {
  const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${t.name}`).get()
  console.log(`  - ${t.name}: ${count.cnt} rows`)
})

console.log('\nMakeup Classes Sample:')
const makeup = db.prepare('SELECT id_makeup, status, teacher_id, section_id FROM makeup_classes LIMIT 5').all()
console.log(JSON.stringify(makeup, null, 2))

console.log('\nTeachers Sample:')
const teachers = db.prepare('SELECT id_teacher, prefix, first_name, last_name FROM teachers LIMIT 3').all()
console.log(JSON.stringify(teachers, null, 2))
