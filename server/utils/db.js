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


// curriculums
db.exec(`
  CREATE TABLE IF NOT EXISTS curriculums (
    id_curriculum INTEGER PRIMARY KEY AUTOINCREMENT,
    name_curriculum TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`)

// curriculum_categories
db.exec(`
  CREATE TABLE IF NOT EXISTS curriculum_categories (
    id_category INTEGER PRIMARY KEY AUTOINCREMENT,
    id_curriculum INTEGER NOT NULL,
    parent_id INTEGER,
    name_category TEXT NOT NULL,
    FOREIGN KEY (id_curriculum) REFERENCES curriculums(id_curriculum) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES curriculum_categories(id_category) ON DELETE CASCADE
  );`)

// curriculum_subjects
db.exec(`
  CREATE TABLE IF NOT EXISTS curriculum_subjects (
    id_subject_curr INTEGER PRIMARY KEY AUTOINCREMENT,
    id_category INTEGER NOT NULL,
    subject_code TEXT,
    name_subject TEXT NOT NULL,
    credit INTEGER DEFAULT 0,
    FOREIGN KEY (id_category) REFERENCES curriculum_categories(id_category) ON DELETE CASCADE
  );`)

// study_plans
db.exec(`
  CREATE TABLE IF NOT EXISTS study_plans (
    id_plan INTEGER PRIMARY KEY AUTOINCREMENT,
    id_curriculum INTEGER NOT NULL,
    name_plan TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_curriculum) REFERENCES curriculums(id_curriculum) ON DELETE CASCADE
  );`)

// study_plan_subjects
db.exec(`
  CREATE TABLE IF NOT EXISTS study_plan_subjects (
    id_plan_subject INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plan INTEGER NOT NULL,
    id_subject_curr INTEGER NOT NULL,
    year INTEGER DEFAULT 1,
    semester INTEGER DEFAULT 1,
    theory_hours INTEGER DEFAULT 0,
    practical_hours INTEGER DEFAULT 0,
    FOREIGN KEY (id_plan) REFERENCES study_plans(id_plan) ON DELETE CASCADE,
    FOREIGN KEY (id_subject_curr) REFERENCES curriculum_subjects(id_subject_curr) ON DELETE CASCADE,
    UNIQUE(id_plan, id_subject_curr)
  );`)

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
  // Migration: Add year and semester to study_plan_subjects
  const spsTableInfo = db.prepare('PRAGMA table_info(study_plan_subjects)').all()
  if (!spsTableInfo.some(col => col.name === 'year')) {
    db.exec('ALTER TABLE study_plan_subjects ADD COLUMN year INTEGER DEFAULT 1')
    console.log('Migrated study_plan_subjects table: added year column')
  }
  if (!spsTableInfo.some(col => col.name === 'semester')) {
    db.exec('ALTER TABLE study_plan_subjects ADD COLUMN semester INTEGER DEFAULT 1')
    console.log('Migrated study_plan_subjects table: added semester column')
  }

  // Migration: Move theory_hours and practical_hours to study_plan_subjects
  if (!spsTableInfo.some(col => col.name === 'theory_hours')) {
    db.exec('ALTER TABLE study_plan_subjects ADD COLUMN theory_hours INTEGER DEFAULT 0')
    db.exec('ALTER TABLE study_plan_subjects ADD COLUMN practical_hours INTEGER DEFAULT 0')
    console.log('Migrated study_plan_subjects table: added theory_hours, practical_hours columns')

    // Copy data from curriculum_subjects before we drop those columns
    db.exec(`
      UPDATE study_plan_subjects
      SET theory_hours = (SELECT IFNULL(theory_hours, 0) FROM curriculum_subjects WHERE curriculum_subjects.id_subject_curr = study_plan_subjects.id_subject_curr),
          practical_hours = (SELECT IFNULL(practical_hours, 0) FROM curriculum_subjects WHERE curriculum_subjects.id_subject_curr = study_plan_subjects.id_subject_curr)
    `)
    console.log('Copied theory and practical hours from curriculum_subjects to study_plan_subjects')
  }

  // Migration: Drop them from curriculum_subjects
  safeDropColumn('curriculum_subjects', 'theory_hours')
  safeDropColumn('curriculum_subjects', 'practical_hours')

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
    year INTEGER DEFAULT 1,
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



// Migration (Cleanup & Restructure)
try {
  // 1. Existing cleanups
  safeDropColumn('teachers', 'name')
  safeDropColumn('calendar_events', 'teacher_name')
  safeDropColumn('rooms', 'capacity')
  safeDropColumn('rooms', 'building')
  safeDropColumn('Subjects', 'id_room')
  safeDropColumn('Subjects', 'name_subject')
  safeDropColumn('teachers', 'subject')
  safeDropColumn('study_plans', 'year')
  safeDropColumn('study_plans', 'semester')

  // Keep legacy section_terms table in place so older data is not discarded
  // during startup migrations. It is no longer used by the current schema,
  // but leaving it intact avoids accidental data loss on deploy.

  // Add term column to Subjects if missing
  const subjectInfo = db.prepare('PRAGMA table_info(Subjects)').all()
  if (!subjectInfo.some(col => col.name === 'term')) {
    db.exec('ALTER TABLE Subjects ADD COLUMN term TEXT')
    console.log('Migrated Subjects table: added term column')
  }

  // Add index for Subjects term
  db.exec('CREATE INDEX IF NOT EXISTS idx_subjects_term ON Subjects(term)')

  // Add curriculum_subject_id to Subjects if missing
  if (!subjectInfo.some(col => col.name === 'curriculum_subject_id')) {
    db.exec('ALTER TABLE Subjects ADD COLUMN curriculum_subject_id INTEGER REFERENCES curriculum_subjects(id_subject_curr) ON DELETE SET NULL')
    console.log('Migrated Subjects table: added curriculum_subject_id column')
  }

  // Add external_teacher_name to Subjects if missing
  if (!subjectInfo.some(col => col.name === 'external_teacher_name')) {
    db.exec('ALTER TABLE Subjects ADD COLUMN external_teacher_name TEXT')
    console.log('Migrated Subjects table: added external_teacher_name column')
  }

  // Add hide_in_teacher_schedule to Subjects if missing
  if (!subjectInfo.some(col => col.name === 'hide_in_teacher_schedule')) {
    db.exec('ALTER TABLE Subjects ADD COLUMN hide_in_teacher_schedule INTEGER DEFAULT 0')
    console.log('Migrated Subjects table: added hide_in_teacher_schedule column')
  }

  // Add credits and hours to curriculum_subjects
  const currSubjectsInfo = db.prepare('PRAGMA table_info(curriculum_subjects)').all()
  if (!currSubjectsInfo.some(col => col.name === 'credit')) {
    db.exec('ALTER TABLE curriculum_subjects ADD COLUMN credit INTEGER DEFAULT 0')
    db.exec('ALTER TABLE curriculum_subjects ADD COLUMN theory_hours INTEGER DEFAULT 0')
    db.exec('ALTER TABLE curriculum_subjects ADD COLUMN practical_hours INTEGER DEFAULT 0')
    console.log('Migrated curriculum_subjects table: added credit, theory_hours, practical_hours columns')
  }

  // 2. Sections/Terms Restructuring
  const sectionInfo = db.prepare('PRAGMA table_info(sections)').all()
  
  // Add id_plan to sections if missing
  if (!sectionInfo.some(col => col.name === 'id_plan')) {
    db.exec('ALTER TABLE sections ADD COLUMN id_plan INTEGER REFERENCES study_plans(id_plan) ON DELETE SET NULL')
    console.log('Migrated sections table: added id_plan column')
  }
  if (!sectionInfo.some(col => col.name === 'year')) {
    db.exec('ALTER TABLE sections ADD COLUMN year INTEGER DEFAULT 1')
    console.log('Migrated sections table: added year column')
  }

  // Add id_plan_subject to Subjects if missing
  if (!subjectInfo.some(col => col.name === 'id_plan_subject')) {
    db.exec('ALTER TABLE Subjects ADD COLUMN id_plan_subject INTEGER REFERENCES study_plan_subjects(id_plan_subject) ON DELETE SET NULL')
    console.log('Migrated Subjects table: added id_plan_subject column')
  }

  db.exec(`
    UPDATE Subjects
    SET hide_in_teacher_schedule = 1
    WHERE hide_in_teacher_schedule IS NULL
       OR (
         hide_in_teacher_schedule = 0
         AND EXISTS (
           SELECT 1
           FROM curriculum_subjects cs
           WHERE cs.id_subject_curr = Subjects.curriculum_subject_id
             AND (
               cs.name_subject LIKE '%ฝึกงาน%'
               OR cs.subject_code LIKE '%ฝึกงาน%'
             )
         )
       )
  `)

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
      for (const name in masterSections) {
        const m = masterSections[name]
        const res = insertMaster.run(m.name, m.description, m.created_at)
        const newId = res.lastInsertRowid

        for (const old of m.oldIds) {
          mapping[old.id] = newId
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
    console.log('Finalizing Subjects term data...')
    db.exec(`
      UPDATE Subjects 
      SET term = (
        SELECT ss.term 
        FROM SubjectSections ss
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
