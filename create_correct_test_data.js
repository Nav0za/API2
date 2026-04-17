import Database from 'better-sqlite3'
const db = new Database('./server/data/data.db')

// Delete existing test data
console.log('Deleting existing test makeup_classes...')
db.prepare('DELETE FROM makeup_classes WHERE id_makeup >= 10').run()

// Insert correct test makeup class data
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

console.log('Creating correct test makeup_classes data...')

const teacher = db.prepare('SELECT id_teacher FROM teachers LIMIT 1').get()
const section = db.prepare('SELECT id_section FROM sections LIMIT 1').get()
const subject = db.prepare('SELECT id_subject FROM Subjects LIMIT 1').get()
const room = db.prepare('SELECT id_room FROM rooms LIMIT 1').get()

if (!teacher || !section || !subject) {
  console.error('Missing required data')
  process.exit(1)
}

const insertStmt = db.prepare(`
  INSERT INTO makeup_classes (
    original_date, original_time_slot, makeup_date, 
    makeup_time_start, makeup_time_end, teacher_id, 
    section_id, subject_id, room_id, status, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Create test makeup classes with different times
const timeSlots = [
  ['08:00', '09:00'],
  ['10:00', '11:00'],
  ['13:00', '14:00']
]

timeSlots.forEach((slot, i) => {
  const result = insertStmt.run(
    today,
    `${slot[0]}-${slot[1]}`,
    tomorrow,
    slot[0],
    slot[1],
    teacher.id_teacher,
    section.id_section,
    subject.id_subject,
    room?.id_room || null,
    'confirmed',
    `Test makeup class ${i + 1}`
  )
  console.log(`  Created makeup_class ID: ${result.lastInsertRowid}, time: ${slot[0]}-${slot[1]}`)
})

// Verify
const all = db.prepare('SELECT id_makeup, status, makeup_time_start, makeup_time_end FROM makeup_classes').all()
console.log('\nAll makeup_classes:')
console.log(JSON.stringify(all, null, 2))
