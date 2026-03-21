import db from '../../utils/db'

export default defineEventHandler(async (event) => {
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

  // Check for duplicate term/year
  const existingTerm = db.prepare('SELECT 1 FROM terms WHERE term = ? AND academic_year = ?').get(body.term, body.academic_year)
  if (existingTerm) {
    throw createError({
      statusCode: 409,
      statusMessage: `เทอม ${body.term}/${body.academic_year} มีอยู่ในระบบแล้ว`
    })
  }

  // Check for overlapping dates
  // Logic: (StartA <= EndB) and (EndA >= StartB)
  const overlappingTerm = db.prepare(`
      SELECT term, academic_year FROM terms
      WHERE start_date <= ? AND end_date >= ?
    `).get(body.end_date, body.start_date)

  if (overlappingTerm) {
    throw createError({
      statusCode: 409,
      statusMessage: `ช่วงเวลาซ้อนทับกับเทอม ${overlappingTerm.term}/${overlappingTerm.academic_year}`
    })
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
})
