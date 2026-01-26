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

// Subjects
db.exec(`
  CREATE TABLE IF NOT EXISTS Subjects (
    id_subject INTEGER PRIMARY KEY AUTOINCREMENT,
    name_subject TEXT UNIQUE,
    term TEXT,
    id_teacher INTEGER,
    FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
      ON DELETE CASCADE
  );`)

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
    background_color TEXT DEFAULT '#3b82f6',
    border_color TEXT DEFAULT '#3b82f6',
    teacher_id INTEGER,
    teacher_name TEXT,
    description TEXT,
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

export default db
