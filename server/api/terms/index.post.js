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

  const newTermId = Number(result.lastInsertRowid)
  const newTermStr = `${body.term}/${body.academic_year}`

  // Auto-copy sections from the most recent previous term
  let copiedSections = 0
  const allTerms = db.prepare('SELECT * FROM terms ORDER BY academic_year DESC, term DESC').all()
  const previousTerm = allTerms.find(t => t.id_term !== newTermId)

  if (previousTerm) {
    const prevTermStr = `${previousTerm.term}/${previousTerm.academic_year}`
    const prevSections = db.prepare('SELECT section_name, description FROM sections WHERE term = ?').all(prevTermStr)
    const insertSection = db.prepare('INSERT INTO sections (section_name, term, description) VALUES (?, ?, ?)')

    for (const sec of prevSections) {
      try {
        insertSection.run(sec.section_name, newTermStr, sec.description)
        copiedSections++
      } catch (e) {
        // Skip if duplicate (UNIQUE constraint on section_name + term)
        console.warn(`Skipped duplicate section: ${sec.section_name} for term ${newTermStr}`)
      }
    }
  }

  return {
    id_term: newTermId,
    term: body.term,
    academic_year: body.academic_year,
    start_date: body.start_date,
    end_date: body.end_date,
    copiedSections
  }
})
