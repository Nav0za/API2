import Database from 'better-sqlite3'
import { resolve } from 'path'

const dbPath = resolve('./server/data/data.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE
  );`)

export default db
