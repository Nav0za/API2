
const db = require('../server/utils/db.js').default;

console.log('Starting migration to make makeup_date nullable...');

try {
    db.transaction(() => {
        // 1. Create new table
        db.prepare(`
      CREATE TABLE IF NOT EXISTS makeup_classes_new (
        id_makeup INTEGER PRIMARY KEY AUTOINCREMENT,
        original_date TEXT NOT NULL,
        original_time_slot TEXT,
        makeup_date TEXT, -- Nullable now
        makeup_time_start TEXT,
        makeup_time_end TEXT,
        teacher_id INTEGER NOT NULL,
        section_id INTEGER,
        subject_id INTEGER,
        room_id INTEGER,
        status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id_teacher),
        FOREIGN KEY (section_id) REFERENCES sections(id_section),
        FOREIGN KEY (subject_id) REFERENCES Subjects(id_subject),
        FOREIGN KEY (room_id) REFERENCES rooms(id_room)
      )
    `).run();

        // 2. Copy data
        db.prepare(`
      INSERT INTO makeup_classes_new (
        id_makeup, original_date, original_time_slot, makeup_date, 
        makeup_time_start, makeup_time_end, teacher_id, section_id, 
        subject_id, room_id, status, notes, created_at, updated_at
      )
      SELECT 
        id_makeup, original_date, original_time_slot, makeup_date, 
        makeup_time_start, makeup_time_end, teacher_id, section_id, 
        subject_id, room_id, status, notes, created_at, updated_at
      FROM makeup_classes
    `).run();

        // 3. Drop old table
        db.prepare('DROP TABLE makeup_classes').run();

        // 4. Rename new table
        db.prepare('ALTER TABLE makeup_classes_new RENAME TO makeup_classes').run();

        // 5. Re-create index
        db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_makeup_makeup_date 
      ON makeup_classes(makeup_date)
    `).run();
    })();

    console.log('Migration successful!');
} catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
}
