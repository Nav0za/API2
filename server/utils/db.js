import Database from 'better-sqlite3'
import { resolve } from 'path'

const dbPath = resolve('./server/data/data.db')
const db = new Database(dbPath)

// teachers
db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id_teacher INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    subject TEXT
  );`)

// Subjects - Note: UNIQUE constraint removed to allow duplicate subject names with different sections
db.exec(`
  CREATE TABLE IF NOT EXISTS Subjects (
    id_subject INTEGER PRIMARY KEY AUTOINCREMENT,
    name_subject TEXT NOT NULL,
    term TEXT,
    id_teacher INTEGER,
    id_section INTEGER,
    id_room INTEGER,
    FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
      ON DELETE CASCADE,
    FOREIGN KEY (id_section) REFERENCES sections(id_section)
      ON DELETE SET NULL,
    FOREIGN KEY (id_room) REFERENCES rooms(id_room)
      ON DELETE SET NULL
  );`)

// Indexes for Subjects table
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_subjects_teacher 
  ON Subjects(id_teacher);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_subjects_term 
  ON Subjects(term);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_subjects_section 
  ON Subjects(id_section);`)

// Migrations
try {
  const tableInfo = db.prepare('PRAGMA table_info(Subjects)').all()

  // Migration: Add id_section if not exists
  const hasIdSection = tableInfo.some(col => col.name === 'id_section')
  if (!hasIdSection) {
    db.exec('ALTER TABLE Subjects ADD COLUMN id_section INTEGER REFERENCES sections(id_section) ON DELETE SET NULL')
    console.log('Migrated Subjects table: added id_section')
  }

  // Migration: Add id_room if not exists
  const hasIdRoom = tableInfo.some(col => col.name === 'id_room')
  if (!hasIdRoom) {
    db.exec('ALTER TABLE Subjects ADD COLUMN id_room INTEGER REFERENCES rooms(id_room) ON DELETE SET NULL')
    console.log('Migrated Subjects table: added id_room')
  }

  // Create index for id_room after migration
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subjects_room 
    ON Subjects(id_room);`)

  // Create SubjectSections join table
  db.exec(`
    CREATE TABLE IF NOT EXISTS SubjectSections (
      id_subject INTEGER,
      id_section INTEGER,
      PRIMARY KEY (id_subject, id_section),
      FOREIGN KEY (id_subject) REFERENCES Subjects(id_subject) ON DELETE CASCADE,
      FOREIGN KEY (id_section) REFERENCES sections(id_section) ON DELETE CASCADE
    );
  `)

  // Migration: Move id_section from Subjects to SubjectSections
  const subjectsWithSection = db.prepare('SELECT id_subject, id_section FROM Subjects WHERE id_section IS NOT NULL').all()
  if (subjectsWithSection.length > 0) {
    const insertSection = db.prepare('INSERT OR IGNORE INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
    const transaction = db.transaction((data) => {
      for (const item of data) {
        insertSection.run(item.id_subject, item.id_section)
      }
    })
    transaction(subjectsWithSection)
    console.log(`Migrated ${subjectsWithSection.length} subjects to SubjectSections`)

    // Optional: Clear id_section in Subjects once migrated to avoid confusion
    // db.exec('UPDATE Subjects SET id_section = NULL')
  }

} catch (err) {
  console.error('Migration error:', err)
}

// schedules
db.exec(`
  CREATE TABLE IF NOT EXISTS schedules (
    id_schedule INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduleData TEXT,
    term TEXT,
    id_teacher INTEGER,
    FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
      ON DELETE CASCADE
  );`)

// terms
db.exec(`
  CREATE TABLE IF NOT EXISTS terms (
    id_term INTEGER PRIMARY KEY AUTOINCREMENT,
    term INTEGER NOT NULL,
    academic_year INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL
  );`)

// calendar_events
db.exec(`
  CREATE TABLE IF NOT EXISTS calendar_events (
    id_event INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    event_type TEXT DEFAULT 'normal',
    background_color TEXT DEFAULT '#3b82f6',
    border_color TEXT DEFAULT '#3b82f6',
    teacher_id INTEGER,
    teacher_name TEXT,
    description TEXT,
    all_day INTEGER DEFAULT 0,
    original_date TEXT,
    makeup_class_ids TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id_teacher)
      ON DELETE SET NULL
  );`)

// สร้าง indexes สำหรับ calendar_events
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_calendar_events_start 
  ON calendar_events(start);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_calendar_events_teacher 
  ON calendar_events(teacher_id);`)

// Migration: Add event_type, all_day, original_date, and makeup_class_ids to calendar_events if not exists
try {
  const tableInfo = db.prepare('PRAGMA table_info(calendar_events)').all()

  const hasEventType = tableInfo.some(col => col.name === 'event_type')
  if (!hasEventType) {
    db.exec("ALTER TABLE calendar_events ADD COLUMN event_type TEXT DEFAULT 'normal'")
    console.log('Migrated calendar_events table: added event_type')
  }

  const hasAllDay = tableInfo.some(col => col.name === 'all_day')
  if (!hasAllDay) {
    db.exec("ALTER TABLE calendar_events ADD COLUMN all_day INTEGER DEFAULT 0")
    console.log('Migrated calendar_events table: added all_day')
  }

  const hasOriginalDate = tableInfo.some(col => col.name === 'original_date')
  if (!hasOriginalDate) {
    db.exec("ALTER TABLE calendar_events ADD COLUMN original_date TEXT")
    console.log('Migrated calendar_events table: added original_date')
  }

  const hasMakeupClassIds = tableInfo.some(col => col.name === 'makeup_class_ids')
  if (!hasMakeupClassIds) {
    db.exec("ALTER TABLE calendar_events ADD COLUMN makeup_class_ids TEXT")
    console.log('Migrated calendar_events table: added makeup_class_ids')
  }
} catch (err) {
  console.error('Migration error (calendar_events):', err)
}

// sections - กลุ่มเรียนนักศึกษา
db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    id_section INTEGER PRIMARY KEY AUTOINCREMENT,
    section_name TEXT NOT NULL,
    term TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section_name, term)
  );`)

// section_schedules - ตารางเรียนของกลุ่ม
db.exec(`
  CREATE TABLE IF NOT EXISTS section_schedules (
    id_section_schedule INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduleData TEXT NOT NULL,
    term TEXT NOT NULL,
    id_section INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_section) REFERENCES sections(id_section)
      ON DELETE CASCADE,
    UNIQUE(id_section, term)
  );`)

// สร้าง indexes สำหรับ sections
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sections_term 
  ON sections(term);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_section_schedules_section 
  ON section_schedules(id_section);`)

// rooms - ห้องเรียน
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id_room INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL UNIQUE,
    building TEXT,
    capacity INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`)

// makeup_classes - คลาสสอนชดเชย
db.exec(`
  CREATE TABLE IF NOT EXISTS makeup_classes (
    id_makeup INTEGER PRIMARY KEY AUTOINCREMENT,
    original_date TEXT NOT NULL,
    original_time_slot TEXT NOT NULL,
    makeup_date TEXT NOT NULL,
    makeup_time_start TEXT NOT NULL,
    makeup_time_end TEXT NOT NULL,
    teacher_id INTEGER NOT NULL,
    section_id INTEGER,
    subject_id INTEGER,
    room_id INTEGER,
    status TEXT DEFAULT 'suggested',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id_teacher) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id_section) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES Subjects(id_subject) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id_room) ON DELETE SET NULL
  );`)

// สร้าง indexes สำหรับ makeup_classes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_makeup_original_date 
  ON makeup_classes(original_date);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_makeup_makeup_date 
  ON makeup_classes(makeup_date);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_makeup_teacher 
  ON makeup_classes(teacher_id);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_makeup_status 
  ON makeup_classes(status);`)

export default db
