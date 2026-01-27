import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { term } = query

  // GET - ดึงข้อมูลกลุ่มเรียน
  if (event.node.req.method === 'GET') {
    let stmt
    let sections

    if (term) {
      // ดึงตามเทอม
      stmt = db.prepare('SELECT * FROM sections WHERE term = ? ORDER BY section_name')
      sections = stmt.all(term)
    } else {
      // ดึงทั้งหมด
      stmt = db.prepare('SELECT * FROM sections ORDER BY term DESC, section_name')
      sections = stmt.all()
    }

    return sections
  }

  // POST - เพิ่มกลุ่มเรียนใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    // Validate
    if (!body.section_name || !body.term) {
      throw createError({
        statusCode: 400,
        statusMessage: 'section_name and term are required'
      })
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO sections (section_name, term, description)
        VALUES (?, ?, ?)
      `)

      const result = stmt.run(
        body.section_name,
        body.term,
        body.description || null
      )

      return {
        id_section: result.lastInsertRowid,
        section_name: body.section_name,
        term: body.term,
        description: body.description || null,
        created_at: new Date().toISOString()
      }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Section name already exists in this term'
        })
      }
      throw error
    }
  }
})
