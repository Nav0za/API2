import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'server', 'data', 'data.db');
const db = new Database(dbPath);

console.log('Table Info for sections:');
const info = db.prepare('PRAGMA table_info(sections)').all();
console.log(JSON.stringify(info, null, 2));
db.close();
