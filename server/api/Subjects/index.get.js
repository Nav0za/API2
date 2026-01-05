import db from '../../utils/db.js'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const { id_teacher } = query

  let stmt
  let subjects
  // เช็คว่ามี id teacher มั้ย
  if (id_teacher) {
    stmt = db.prepare('SELECT * FROM Subjects WHERE id_teacher = ?')
    subjects = stmt.all(id_teacher)
  } else {
    stmt = db.prepare('SELECT * FROM Subjects')
    subjects = stmt.all()
  }
  return subjects
})
