import Database from 'better-sqlite3'
import { resolve } from 'path'
import { existsSync } from 'fs'

const dbPath = resolve('./server/data/data.db')

if (!existsSync(dbPath)) {
    console.error(`Database file not found at ${dbPath}`)
    process.exit(1)
}

const db = new Database(dbPath)

console.log('Starting migration: Remove UNIQUE constraint from Subjects.name_subject')

try {
    // SQLite doesn't support ALTER TABLE DROP CONSTRAINT
    // We need to recreate the table without the UNIQUE constraint

    db.exec('BEGIN TRANSACTION')

    // 1. Create new table without UNIQUE constraint on name_subject
    console.log('Creating new Subjects table...')
    db.exec(`
    CREATE TABLE IF NOT EXISTS Subjects_new (
      id_subject INTEGER PRIMARY KEY AUTOINCREMENT,
      name_subject TEXT NOT NULL,
      term TEXT,
      id_teacher INTEGER,
      id_section INTEGER,
      FOREIGN KEY (id_teacher) REFERENCES teachers(id_teacher)
        ON DELETE CASCADE,
      FOREIGN KEY (id_section) REFERENCES sections(id_section)
        ON DELETE SET NULL
    );
  `)

    // 2. Copy data from old table to new table
    console.log('Copying data...')
    db.exec(`
    INSERT INTO Subjects_new (id_subject, name_subject, term, id_teacher, id_section)
    SELECT id_subject, name_subject, term, id_teacher, id_section
    FROM Subjects;
  `)

    // 3. Drop old table
    console.log('Dropping old Subjects table...')
    db.exec('DROP TABLE Subjects')

    // 4. Rename new table to Subjects
    console.log('Renaming new table...')
    db.exec('ALTER TABLE Subjects_new RENAME TO Subjects')

    // 5. Recreate indexes if any existed
    console.log('Recreating indexes...')
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subjects_teacher 
    ON Subjects(id_teacher);
  `)

    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subjects_term 
    ON Subjects(term);
  `)

    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subjects_section 
    ON Subjects(id_section);
  `)

    db.exec('COMMIT')

    console.log('✅ Migration completed successfully!')
    console.log('Subjects table now allows duplicate subject names with different sections.')

} catch (error) {
    console.error('❌ Migration failed:', error)
    db.exec('ROLLBACK')
    process.exit(1)
} finally {
    db.close()
}
