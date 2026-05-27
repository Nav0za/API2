import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'server', 'data', 'data.db');
const db = new Database(dbPath);

console.log('Ensuring id_plan column exists in sections table...');
try {
    const tableInfo = db.prepare('PRAGMA table_info(sections)').all();
    const hasIdPlan = tableInfo.some(col => col.name === 'id_plan');
    
    if (!hasIdPlan) {
        console.log('Adding id_plan column...');
        db.exec('ALTER TABLE sections ADD COLUMN id_plan INTEGER');
        console.log('Success.');
    } else {
        console.log('Column already exists.');
    }
} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
