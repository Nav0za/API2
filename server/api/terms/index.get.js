import db from '../../utils/db'

export default defineEventHandler(() => {
  const stmt = db.prepare('SELECT * FROM terms')
  const terms = stmt.all()
  return terms
})
