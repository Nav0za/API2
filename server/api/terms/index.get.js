import db from '../../utils/db'

export default defineEventHandler(() => {
  const stmt = db.prepare('SELECT * FROM terms ORDER BY academic_year DESC, term DESC')
  const terms = stmt.all()
  return terms
})
