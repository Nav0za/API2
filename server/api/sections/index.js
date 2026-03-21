import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  // GET - ดึงกลุ่มเรียนทั้งหมด (ไม่แยกเทอม)
  if (event.node.req.method === 'GET') {
    const sections = db.prepare('SELECT * FROM sections ORDER BY section_name').all()
    return sections
  }

  // POST - เพิ่มกลุ่มเรียนใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    if (!body.section_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'section_name is required'
      })
    }

    try {
      // เช็คว่ามีกลุ่มเรียนชื่อนี้อยู่แล้วหรือไม่
      const existing = db.prepare('SELECT id_section FROM sections WHERE section_name = ?').get(body.section_name)
      
      if (existing) {
        // อัปเดตคำอธิบายถ้ามี
        if (body.description) {
          db.prepare('UPDATE sections SET description = ? WHERE id_section = ?').run(body.description, existing.id_section)
        }
        return {
          id_section: existing.id_section,
          section_name: body.section_name,
          description: body.description || null,
          message: 'กลุ่มเรียนนี้มีอยู่แล้ว อัปเดตข้อมูลแล้ว'
        }
      }

      const res = db.prepare('INSERT INTO sections (section_name, description) VALUES (?, ?)').run(
        body.section_name,
        body.description || null
      )

      return {
        id_section: res.lastInsertRowid,
        section_name: body.section_name,
        description: body.description || null,
        created_at: new Date().toISOString()
      }
    } catch (error) {
      throw error
    }
  }
})
