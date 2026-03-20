import Database from 'better-sqlite3'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

// ใช้โฟลเดอร์ server/data
const dbDir = resolve(process.cwd(), 'server', 'data')

// ถ้าโฟลเดอร์ไม่มี ให้สร้าง
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const dbPath = resolve(dbDir, 'data.db')
const db = new Database(dbPath)

// teachers
db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id_teacher INTEGER PRIMARY KEY AUTOINCREMENT,
    prefix TEXT,
    first_name TEXT,
    last_name TEXT
  );`)

// Subjects - วิชาที่สอน
db.exec(`
  CREATE TABLE IF NOT EXISTS Subjects (
    id_subject INTEGER PRIMARY KEY AUTOINCREMENT,
    name_subject TEXT NOT NULL,
    id_teacher INTEGER,
    term TEXT,
    FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
      ON DELETE CASCADE
  );`)

// Indexes for Subjects table
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_subjects_teacher 
  ON Subjects(id_teacher);`)

// No longer indexing term or id_section since they are removed

// Migrations
try {
  const tableInfo = db.prepare('PRAGMA table_info(Subjects)').all()

  // Migration for adding id_room to Subjects (REMOVED: already dropped if exists below)

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

  // Note: Migration logic that moved data from Subjects.id_section to SubjectSections
  // has been removed since the id_section column is no longer created in Subjects table natively.

  // Migration for teachers name structure
  const teacherTableInfo = db.prepare('PRAGMA table_info(teachers)').all()
  const hasPrefix = teacherTableInfo.some(col => col.name === 'prefix')

  if (!hasPrefix) {
    db.exec('ALTER TABLE teachers ADD COLUMN prefix TEXT')
    db.exec('ALTER TABLE teachers ADD COLUMN first_name TEXT')
    db.exec('ALTER TABLE teachers ADD COLUMN last_name TEXT')
    console.log('Migrated teachers table: added prefix, first_name, last_name')

    // Split existing names
    const teachers = db.prepare('SELECT id_teacher, name FROM teachers').all()
    const updateTeacher = db.prepare('UPDATE teachers SET prefix = ?, first_name = ?, last_name = ? WHERE id_teacher = ?')

    db.transaction(() => {
      const thaiPrefixes = ['นาย', 'นาง', 'นางสาว', 'น.ส.', 'ดร.', 'ผศ.', 'รศ.', 'ศ.', 'อาจารย์', 'อ.', 'ครู']
      for (const t of teachers) {
        let name = t.name.trim()
        let prefix = ''
        let first = ''
        let last = ''

        // Try to find prefix
        for (const p of thaiPrefixes) {
          if (name.startsWith(p)) {
            prefix = p
            name = name.substring(p.length).trim()
            break
          }
        }

        const parts = name.split(/\s+/)
        first = parts[0] || ''
        last = parts.slice(1).join(' ')

        updateTeacher.run(prefix, first, last, t.id_teacher)
      }
    })()
    console.log(`Migrated ${teachers.length} teachers name data`)
  }

  // Migration: Remove unused 'subject' column from teachers
  if (teacherTableInfo.some(col => col.name === 'subject')) {
    db.exec('ALTER TABLE teachers DROP COLUMN subject')
    console.log('Migrated teachers table: removed unused subject column')
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
    db.exec('ALTER TABLE calendar_events ADD COLUMN event_type TEXT DEFAULT \'normal\'')
    console.log('Migrated calendar_events table: added event_type')
  }

  const hasAllDay = tableInfo.some(col => col.name === 'all_day')
  if (!hasAllDay) {
    db.exec('ALTER TABLE calendar_events ADD COLUMN all_day INTEGER DEFAULT 0')
    console.log('Migrated calendar_events table: added all_day')
  }

  const hasOriginalDate = tableInfo.some(col => col.name === 'original_date')
  if (!hasOriginalDate) {
    db.exec('ALTER TABLE calendar_events ADD COLUMN original_date TEXT')
    console.log('Migrated calendar_events table: added original_date')
  }

  const hasMakeupClassIds = tableInfo.some(col => col.name === 'makeup_class_ids')
  if (!hasMakeupClassIds) {
    db.exec('ALTER TABLE calendar_events ADD COLUMN makeup_class_ids TEXT')
    console.log('Migrated calendar_events table: added makeup_class_ids')
  }
} catch (err) {
  console.error('Migration error (calendar_events):', err)
}

// sections - กลุ่มเรียนนักศึกษา (Master Table)
db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    id_section INTEGER PRIMARY KEY AUTOINCREMENT,
    section_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`)

// section_terms - ตารางเชื่อมกลุ่มเรียนกับเทอม
db.exec(`
  CREATE TABLE IF NOT EXISTS section_terms (
    id_section_term INTEGER PRIMARY KEY AUTOINCREMENT,
    id_section INTEGER NOT NULL,
    term TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (id_section) REFERENCES sections(id_section) ON DELETE CASCADE,
    UNIQUE(id_section, term)
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
  CREATE INDEX IF NOT EXISTS idx_section_terms_term 
  ON section_terms(term);`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_section_schedules_section 
  ON section_schedules(id_section);`)

// external_subjects - วิชานอกสาขาที่นักศึกษาเพิ่มเอง
db.exec(`
  CREATE TABLE IF NOT EXISTS external_subjects (
    id_ext_subject   INTEGER PRIMARY KEY AUTOINCREMENT,
    name_subject     TEXT NOT NULL,
    id_section       INTEGER NOT NULL,
    term             TEXT NOT NULL,
    instructor_name  TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_section) REFERENCES sections(id_section) ON DELETE CASCADE
  );
`)

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_ext_subjects_section
  ON external_subjects(id_section, term);
`)

// rooms - ห้องเรียน
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id_room INTEGER PRIMARY KEY AUTOINCREMENT,
    room_name TEXT NOT NULL UNIQUE,
    building TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`)

// makeup_classes - คลาสสอนชดเชย
db.exec(`
  CREATE TABLE IF NOT EXISTS makeup_classes (
    id_makeup INTEGER PRIMARY KEY AUTOINCREMENT,
    original_date TEXT NOT NULL,
    original_time_slot TEXT NOT NULL,
    makeup_date TEXT,
    makeup_time_start TEXT NOT NULL,
    makeup_time_end TEXT NOT NULL,
    teacher_id INTEGER NOT NULL,
    section_id INTEGER,
    subject_id INTEGER,
    room_id INTEGER,
    status TEXT DEFAULT 'confirmed',
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

// Helper for dropping columns safely
const safeDropColumn = (tableName, columnName) => {
  try {
    const info = db.prepare(`PRAGMA table_info(${tableName})`).all()
    if (info.some(col => col.name === columnName)) {
      db.exec(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
      console.log(`Cleaned up ${tableName} table: removed ${columnName} column`)
    }
  } catch (err) {
    console.error(`Error dropping ${columnName} from ${tableName}:`, err.message)
  }
}

// Migration (Cleanup & Restructure)
try {
  // 1. Existing cleanups
  safeDropColumn('teachers', 'name')
  safeDropColumn('calendar_events', 'teacher_name')
  safeDropColumn('rooms', 'capacity')
  safeDropColumn('Subjects', 'id_room')
  safeDropColumn('teachers', 'subject')

  // Add term column to Subjects if missing
  const subjectInfo = db.prepare('PRAGMA table_info(Subjects)').all()
  if (!subjectInfo.some(col => col.name === 'term')) {
    db.exec('ALTER TABLE Subjects ADD COLUMN term TEXT')
    console.log('Migrated Subjects table: added term column')
  }

  // Add index for Subjects term
  db.exec('CREATE INDEX IF NOT EXISTS idx_subjects_term ON Subjects(term)')

  // 2. Sections/Terms Restructuring
  const sectionInfo = db.prepare('PRAGMA table_info(sections)').all()
  if (sectionInfo.some(col => col.name === 'term')) {
    console.log('Starting Sections/Terms migration...')

    // Get all old section data
    const oldSections = db.prepare('SELECT * FROM sections').all()

    db.transaction(() => {
      // --- CRITICAL FIX: Fetch all data BEFORE any deletions ---
      const oldSubjectSections = db.prepare('SELECT * FROM SubjectSections').all()
      const oldSchedules = db.prepare('SELECT * FROM section_schedules').all()
      const oldExtSubjects = db.prepare('SELECT * FROM external_subjects').all()
      const oldMakeup = db.prepare('SELECT * FROM makeup_classes').all()

      // Create mapping and master list
      const masterSections = {}
      for (const s of oldSections) {
        if (!masterSections[s.section_name]) {
          masterSections[s.section_name] = {
            name: s.section_name,
            description: s.description,
            created_at: s.created_at,
            oldIds: []
          }
        }
        masterSections[s.section_name].oldIds.push({ id: s.id_section, term: s.term })
      }

      const mapping = {} // old_id -> new_master_id

      // Now it's safe to clear
      db.exec('DELETE FROM sections')

      const insertMaster = db.prepare('INSERT INTO sections (section_name, description, created_at) VALUES (?, ?, ?)')
      const insertTerm = db.prepare('INSERT OR IGNORE INTO section_terms (id_section, term) VALUES (?, ?)')

      for (const name in masterSections) {
        const m = masterSections[name]
        const res = insertMaster.run(m.name, m.description, m.created_at)
        const newId = res.lastInsertRowid

        for (const old of m.oldIds) {
          mapping[old.id] = newId
          insertTerm.run(newId, old.term)
        }
      }

      // Re-insert or Update all tables
      // 1. SubjectSections
      const insSS = db.prepare('INSERT OR IGNORE INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
      for (const r of oldSubjectSections) {
        const newSecId = mapping[r.id_section] || r.id_section
        insSS.run(r.id_subject, newSecId)
      }

      // 2. section_schedules
      const updSch = db.prepare('INSERT INTO section_schedules (scheduleData, term, id_section, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      for (const r of oldSchedules) {
        updSch.run(r.scheduleData, r.term, mapping[r.id_section] || r.id_section, r.created_at, r.updated_at)
      }

      // 3. external_subjects
      const updExt = db.prepare('INSERT INTO external_subjects (name_subject, id_section, term, instructor_name, created_at) VALUES (?, ?, ?, ?, ?)')
      for (const r of oldExtSubjects) {
        updExt.run(r.name_subject, mapping[r.id_section] || r.id_section, r.term, r.instructor_name, r.created_at)
      }

      // 4. makeup_classes
      const updMakeup = db.prepare('UPDATE makeup_classes SET section_id = ? WHERE id_makeup = ?')
      for (const r of oldMakeup) {
        if (mapping[r.section_id]) {
          updMakeup.run(mapping[r.section_id], r.id_makeup)
        }
      }
    })()

    // Finalize: Remove 'term' from sections table
    safeDropColumn('sections', 'term')
    console.log('Sections/Terms migration completed successfully.')

    // 2.5 Subjects table migration (Populate term if missing)
    // Run this AFTER section_terms is populated
    console.log('Finalizing Subjects term data...')
    db.exec(`
      UPDATE Subjects 
      SET term = (
        SELECT st.term 
        FROM SubjectSections ss
        JOIN section_terms st ON ss.id_section = st.id_section
        WHERE ss.id_subject = Subjects.id_subject
        LIMIT 1
      )
      WHERE term IS NULL OR term = ''
    `)
  }
} catch (err) {
  console.error('Migration error:', err)
}

export default db
