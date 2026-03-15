const Database = require('better-sqlite3');
const db = new Database('./server/data/data.db');
const fs = require('fs');

const data = {
  terms: db.prepare('SELECT * FROM terms').all(),
  absences: db.prepare('SELECT id_event, title, start, end, event_type, teacher_id FROM calendar_events WHERE event_type = "teacher_absence"').all(),
  all_event_types: db.prepare('SELECT DISTINCT event_type FROM calendar_events').all()
};

fs.writeFileSync('./debug_absences.json', JSON.stringify(data, null, 2));
console.log('Success, wrote debug_absences.json');
