import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method

    // GET - ดึงรายวิชานอกสาขาของกลุ่มนี้
    if (method === 'GET') {
        const query = getQuery(event)
        const { id_section, term } = query

        if (!id_section || !term) {
            throw createError({ statusCode: 400, statusMessage: 'id_section and term are required' })
        }

        const rows = db.prepare(`
      SELECT * FROM external_subjects
      WHERE id_section = ? AND term = ?
      ORDER BY id_ext_subject ASC
    `).all(Number(id_section), term)

        return rows
    }

    // POST - เพิ่มวิชานอกสาขาใหม่
    if (method === 'POST') {
        const body = await readBody(event)
        const { id_section, term, name_subject, instructor_name } = body

        if (!id_section || !term || !name_subject?.trim()) {
            throw createError({ statusCode: 400, statusMessage: 'id_section, term and name_subject are required' })
        }

        const result = db.prepare(`
      INSERT INTO external_subjects (name_subject, id_section, term, instructor_name)
      VALUES (?, ?, ?, ?)
    `).run(name_subject.trim(), Number(id_section), term, instructor_name?.trim() || null)

        return {
            id_ext_subject: result.lastInsertRowid,
            key: `ext:${result.lastInsertRowid}`,
            name_subject: name_subject.trim(),
            instructor_name: instructor_name?.trim() || null,
            id_section: Number(id_section),
            term
        }
    }
})
