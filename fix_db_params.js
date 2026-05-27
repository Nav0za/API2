import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'server', 'data', 'data.db');
const db = new Database(dbPath);

console.log('Checking sections table columns...');
try {
    const tableInfo = db.prepare('PRAGMA table_info(sections)').all();
    const columnNames = tableInfo.map(c => c.name);
    console.log('Columns:', columnNames.join(', '));
    
    if (!columnNames.includes('id_plan')) {
        console.log('id_plan is missing. Adding it now...');
        db.exec('ALTER TABLE sections ADD COLUMN id_plan INTEGER');
        console.log('id_plan added.');
    }
} catch (err) {
    console.error('Error during inspection:', err.message);
} finally {
    db.close();
}
