import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid term id' })
  }

  const body = await readBody(event)

  if (!body.term || !body.academic_year || !body.start_date || !body.end_date) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
  }

  if (body.term <= 0 || body.academic_year <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Term and academic year must be positive numbers' })
  }

  if (body.term > 3 || String(body.academic_year).length > 4) {
    throw createError({ statusCode: 400, statusMessage: 'เทอมต้องอยู่ระหว่าง 1 ถึง 3' })
  }

  // Check that the term exists
  const existing = db.prepare('SELECT * FROM terms WHERE id_term = ?').get(id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Term not found' })
  }

  // Check for duplicate term/year (excluding current term)
  const duplicate = db.prepare(
    'SELECT 1 FROM terms WHERE term = ? AND academic_year = ? AND id_term != ?'
  ).get(body.term, body.academic_year, id)
  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: `เทอม ${body.term}/${body.academic_year} มีอยู่ในระบบแล้ว`
    })
  }

  // Check for overlapping dates (excluding current term)
  const overlapping = db.prepare(`
    SELECT term, academic_year FROM terms
    WHERE start_date <= ? AND end_date >= ? AND id_term != ?
  `).get(body.end_date, body.start_date, id)

  if (overlapping) {
    throw createError({
      statusCode: 409,
      statusMessage: `ช่วงเวลาซ้อนทับกับเทอม ${overlapping.term}/${overlapping.academic_year}`
    })
  }

  const oldTermStr = `${existing.term}/${existing.academic_year}`
  const newTermStr = `${body.term}/${body.academic_year}`

  // If term string changed, update references in related tables
  if (oldTermStr !== newTermStr) {
    const updateRefs = db.transaction(() => {
      db.prepare('UPDATE schedules SET term = ? WHERE term = ?').run(newTermStr, oldTermStr)
      db.prepare('UPDATE section_schedules SET term = ? WHERE term = ?').run(newTermStr, oldTermStr)
      db.prepare('UPDATE section_terms SET term = ? WHERE term = ?').run(newTermStr, oldTermStr)
      db.prepare('UPDATE external_subjects SET term = ? WHERE term = ?').run(newTermStr, oldTermStr)
      db.prepare('UPDATE Subjects SET term = ? WHERE term = ?').run(newTermStr, oldTermStr)
      db.prepare('UPDATE terms SET term = ?, academic_year = ?, start_date = ?, end_date = ? WHERE id_term = ?')
        .run(body.term, body.academic_year, body.start_date, body.end_date, id)
    })
    updateRefs()
  } else {
    db.prepare('UPDATE terms SET term = ?, academic_year = ?, start_date = ?, end_date = ? WHERE id_term = ?')
      .run(body.term, body.academic_year, body.start_date, body.end_date, id)
  }

  return {
    id_term: id,
    term: body.term,
    academic_year: body.academic_year,
    start_date: body.start_date,
    end_date: body.end_date
  }
})
