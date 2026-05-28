import db from '../../utils/db.js'

// Ensure id_plan column exists (safe migration at module load)
try {
  const cols = db.prepare('PRAGMA table_info(sections)').all()
  if (!cols.some(c => c.name === 'id_plan')) {
    db.exec('ALTER TABLE sections ADD COLUMN id_plan INTEGER')
    console.log('[sections API] Added missing id_plan column to sections table')
  }
} catch (e) {
  console.error('[sections API] Migration check error:', e.message)
}

const parsePlanId = (raw) => {
  if (raw == null) return null
  if (typeof raw === 'object') {
    const v = raw.value ?? raw.id_plan ?? null
    if (v == null) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const parseYear = (raw) => {
  if (raw == null) return 1
  if (typeof raw === 'object') {
    const v = raw.value ?? raw.year ?? null
    if (v == null) return 1
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : 1
  }
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export default defineEventHandler(async (event) => {
  // GET - ดึงกลุ่มเรียนทั้งหมด
  if (event.node.req.method === 'GET') {
    const sections = db.prepare(`
      SELECT s.*, p.name_plan, c.name_curriculum as curriculum_name
      FROM sections s
      LEFT JOIN study_plans p ON s.id_plan = p.id_plan
      LEFT JOIN curriculums c ON p.id_curriculum = c.id_curriculum
      ORDER BY s.section_name
    `).all()
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

    const sectionName = String(body.section_name)
    const description = body.description ? String(body.description) : null
    const idPlan = parsePlanId(body.id_plan)
    const year = parseYear(body.year)

    console.log('[sections POST] Received:', { sectionName, description, idPlan })

    try {
      // เช็คว่ามีกลุ่มเรียนชื่อนี้อยู่แล้วหรือไม่
      const existing = db.prepare('SELECT * FROM sections WHERE section_name = ?').get(sectionName)

      if (existing) {
        const finalDesc = description !== null ? description : (existing.description || null)
        const finalPlan = idPlan !== null ? idPlan : (existing.id_plan || null)
        const finalYear = body.year !== undefined ? year : (existing.year || 1)

        db.prepare('UPDATE sections SET description = ?, id_plan = ?, year = ? WHERE id_section = ?')
          .run(finalDesc, finalPlan, finalYear, existing.id_section)

        return {
          id_section: existing.id_section,
          section_name: sectionName,
          description: finalDesc,
          id_plan: finalPlan,
          year: finalYear,
          message: 'อัปเดตข้อมูลกลุ่มเรียนเดิมเรียบร้อยแล้ว'
        }
      }

      const res = db.prepare('INSERT INTO sections (section_name, description, id_plan, year) VALUES (?, ?, ?, ?)')
        .run(sectionName, description, idPlan, year)

      return {
        id_section: res.lastInsertRowid,
        section_name: sectionName,
        description: description,
        id_plan: idPlan,
        year,
        created_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('[sections POST] Error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'ไม่สามารถบันทึกข้อมูลกลุ่มเรียนได้: ' + error.message
      })
    }
  }
})
