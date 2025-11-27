import Database from 'better-sqlite3'
import { resolve } from 'path'

const dbPath = resolve('./server/data/data.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id_teacher INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    subject TEXT
  );`)

export default db
