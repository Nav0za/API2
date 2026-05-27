const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'server', 'data', 'data.db');
const db = new Database(dbPath);

// 1. Check current schema
const info = db.prepare('PRAGMA table_info(sections)').all();
console.log('Current sections columns:');
info.forEach(c => console.log('  - ' + c.name + ' (' + c.type + ')'));

const hasIdPlan = info.some(c => c.name === 'id_plan');
console.log('Has id_plan column: ' + hasIdPlan);

if (!hasIdPlan) {
  console.log('Adding id_plan column now...');
  db.exec('ALTER TABLE sections ADD COLUMN id_plan INTEGER');
  console.log('Done! id_plan column added.');
} else {
  console.log('id_plan column already exists.');
}

// 2. Test insert
console.log('Testing INSERT...');
try {
  const testName = '__TEST_DELETE_ME__';
  db.prepare('DELETE FROM sections WHERE section_name = ?').run(testName);
  
  const res = db.prepare('INSERT INTO sections (section_name, description, id_plan) VALUES (?, ?, ?)').run(
    testName, null, null
  );
  console.log('INSERT OK: lastInsertRowid=' + res.lastInsertRowid);
  
  db.prepare('DELETE FROM sections WHERE section_name = ?').run(testName);
  console.log('Cleanup done.');
} catch (e) {
  console.error('INSERT FAILED: ' + e.message);
}

db.close();
console.log('All checks complete.');
