import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'server', 'data', 'data.db');
const db = new Database(dbPath);

// 1. Check current schema
const info = db.prepare('PRAGMA table_info(sections)').all();
console.log('Current sections columns:');
info.forEach(c => console.log(`  - ${c.name} (${c.type})`));

const hasIdPlan = info.some(c => c.name === 'id_plan');
console.log('\nHas id_plan column:', hasIdPlan);

if (!hasIdPlan) {
  console.log('Adding id_plan column now...');
  db.exec('ALTER TABLE sections ADD COLUMN id_plan INTEGER');
  console.log('Done! id_plan column added.');
} else {
  console.log('id_plan column already exists.');
}

// 2. Test insert
console.log('\nTesting INSERT...');
try {
  const testName = '__TEST_SECTION_DELETE_ME__';
  // Clean up any previous test
  db.prepare('DELETE FROM sections WHERE section_name = ?').run(testName);
  
  const res = db.prepare('INSERT INTO sections (section_name, description, id_plan) VALUES (?, ?, ?)').run(
    testName, null, null
  );
  console.log('INSERT OK:', res);
  
  // Clean up
  db.prepare('DELETE FROM sections WHERE section_name = ?').run(testName);
  console.log('Test cleanup done.');
} catch (e) {
  console.error('INSERT FAILED:', e.message);
}

db.close();
console.log('\nAll checks complete.');
