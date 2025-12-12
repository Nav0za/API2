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
    id_teacher INTEGER,
    FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
      ON DELETE CASCADE
  );`)
// schedules
db.exec(`
  CREATE TABLE IF NOT EXISTS schedules (
    id_schedule INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduleData TEXT,
    id_teacher INTEGER,
    FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
      ON DELETE CASCADE
  );`)


export default db
