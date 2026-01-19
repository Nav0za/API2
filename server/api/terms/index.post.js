import db from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Read request body
    const body = await readBody(event)
    // Validate request body
    if (!body.term || !body.academic_year || !body.start_date || !body.end_date) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
    } else if (body.term <= 0 || body.academic_year <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Term and academic year must be positive numbers' })
    } else if (body.term > 3 || String(body.academic_year).length > 4) {
      throw createError({ statusCode: 400, statusMessage: 'เทอมต้องอยู่ระหว่าง 1 ถึง 3' })
    }

    // Add new term in database
    const stmt = db.prepare('INSERT INTO terms (term, academic_year, start_date, end_date) VALUES (?, ?, ?, ?)')
    const result = stmt.run(body.term, body.academic_year, body.start_date, body.end_date)

    return {
      id_term: Number(result.lastInsertRowid),
      term: body.term,
      academic_year: body.academic_year,
      start_date: body.start_date,
      end_date: body.end_date
    }
  } catch (error) {
    console.error('Error adding term:', error)
  }
})
