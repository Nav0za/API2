import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { term } = query

  // GET - ดึงข้อมูลกลุ่มเรียน
  if (event.node.req.method === 'GET') {
    let stmt
    let sections

    if (term) {
      stmt = db.prepare(`
        SELECT s.*, st.term, (
          SELECT GROUP_CONCAT(term) FROM section_terms WHERE id_section = s.id_section
        ) as all_terms
        FROM sections s
        JOIN section_terms st ON s.id_section = st.id_section
        WHERE st.term = ?
        ORDER BY s.section_name
      `)
      sections = stmt.all(term).map(s => ({
        ...s,
        terms: s.all_terms ? s.all_terms.split(',') : []
      }))
    } else {
      stmt = db.prepare(`
        SELECT s.*, (
           SELECT GROUP_CONCAT(term) FROM section_terms WHERE id_section = s.id_section
        ) as all_terms
        FROM sections s
        ORDER BY s.section_name
      `)
      sections = stmt.all().map(s => ({
        ...s,
        terms: s.all_terms ? s.all_terms.split(',') : [],
        term: s.all_terms ? s.all_terms.split(',')[0] : null
      }))
    }

    return sections
  }

  // POST - เพิ่มกลุ่มเรียนใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    // Validate
    if (!body.section_name || !body.terms || !Array.isArray(body.terms) || body.terms.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'section_name and terms array are required'
      })
    }

    try {
      let insertedSectionId = null
      
      db.transaction(() => {
        // Try to insert section
        const insertStmt = db.prepare('INSERT OR IGNORE INTO sections (section_name, description) VALUES (?, ?)')
        const info = insertStmt.run(body.section_name, body.description || null)
        
        let sectionId = info.lastInsertRowid
        
        // If it was ignored (already exists), get the existing ID
        if (info.changes === 0) {
          const existing = db.prepare('SELECT id_section FROM sections WHERE section_name = ?').get(body.section_name)
          if (existing) {
            sectionId = existing.id_section
          } else {
             throw new Error('Could not insert or find section')
          }
        }
        
        insertedSectionId = sectionId

        const insertTerm = db.prepare('INSERT OR IGNORE INTO section_terms (id_section, term) VALUES (?, ?)')
        for (const t of body.terms) {
          insertTerm.run(sectionId, t)
        }
      })()

      return {
        id_section: insertedSectionId,
        section_name: body.section_name,
        terms: body.terms,
        description: body.description || null,
        created_at: new Date().toISOString()
      }
    } catch (error) {
       throw error
    }
  }
})
