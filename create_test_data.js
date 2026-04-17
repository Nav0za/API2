import Database from 'better-sqlite3'
const db = new Database('./server/data/data.db')

// Insert test makeup class data
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

console.log('Creating test makeup_classes data...')

const teacher = db.prepare('SELECT id_teacher FROM teachers LIMIT 1').get()
const section = db.prepare('SELECT id_section FROM sections LIMIT 1').get()
const subject = db.prepare('SELECT id_subject FROM Subjects LIMIT 1').get()
const room = db.prepare('SELECT id_room FROM rooms LIMIT 1').get()

if (!teacher || !section || !subject) {
  console.error('Missing required data (teacher, section, or subject)')
  process.exit(1)
}

const insertStmt = db.prepare(`
  INSERT INTO makeup_classes (
    original_date, original_time_slot, makeup_date, 
    makeup_time_start, makeup_time_end, teacher_id, 
    section_id, subject_id, room_id, status, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Create 3 test makeup classes
for (let i = 1; i <= 3; i++) {
  const result = insertStmt.run(
    today,
    '08:00-09:00',
    tomorrow,
    '08:00',
    `0${8+i}:00`,
    teacher.id_teacher,
    section.id_section,
    subject.id_subject,
    room?.id_room || null,
    'confirmed',
    `Test makeup class ${i}`
  )
  console.log(`  Created makeup_class ID: ${result.lastInsertRowid}`)
}

// Verify
const count = db.prepare('SELECT COUNT(*) as cnt FROM makeup_classes').get()
console.log(`\nTotal makeup_classes: ${count.cnt}`)

const sample = db.prepare('SELECT id_makeup, status FROM makeup_classes').all()
console.log('Sample:')
console.log(JSON.stringify(sample, null, 2))
