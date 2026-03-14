const Database = require('better-sqlite3');
const db = new Database('./server/data/data.db');
const fs = require('fs');

const data = {
  term: db.prepare('SELECT id_term, start_date, end_date FROM terms LIMIT 1').get(),
  firstEvent: db.prepare('SELECT id_event, start, end, event_type, makeup_class_ids FROM calendar_events WHERE event_type != "holiday" LIMIT 1').get(),
  makeupClass: db.prepare('SELECT id_makeup, teacher_id, section_id FROM makeup_classes LIMIT 1').get()
};

fs.writeFileSync('./debug_db.json', JSON.stringify(data, null, 2));
console.log('Written debug_db.json');
