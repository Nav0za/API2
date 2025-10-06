import db from '../../utils/db.js'

export default defineEventHandler(() => {
  const stmt = db.prepare('SELECT * FROM users')
  const users = stmt.all()
  return users
})
