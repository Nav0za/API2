const db = require('better-sqlite3')('server/data/data.db');
try {
  const sectionName = 'TestSec';
  const description = null;
  const idPlan = null;
  
  const existing = db.prepare('SELECT * FROM sections WHERE section_name = ?').get(sectionName);
  
  if (existing) {
    console.log('Exists:', existing);
    const toUpdateDesc = description ?? existing.description ?? null;
    const toUpdatePlan = idPlan ?? existing.id_plan ?? null;
    
    db.prepare('UPDATE sections SET description = ?, id_plan = ? WHERE id_section = ?')
      .run(toUpdateDesc, toUpdatePlan, existing.id_section);
    console.log('Updated');
  } else {
    console.log('Not exists, inserting...');
    const result = db.prepare('INSERT INTO sections (section_name, description, id_plan) VALUES (?, ?, ?)').run(
      sectionName,
      description,
      idPlan
    );
    console.log('Done:', result);
  }
} catch(e) {
  console.error('ERROR RND:', e);
}
