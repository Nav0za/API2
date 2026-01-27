import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { teacher_id, status, start_date, end_date } = query

  // GET - ดึงข้อมูลคลาสชดเชย
  if (event.node.req.method === 'GET') {
    let sql = `
      SELECT 
        mc.*,
        t.name as teacher_name,
        s.section_name,
        sub.name_subject,
        r.room_name
      FROM makeup_classes mc
      LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
      LEFT JOIN sections s ON mc.section_id = s.id_section
      LEFT JOIN Subjects sub ON mc.subject_id = sub.id_subject
      LEFT JOIN rooms r ON mc.room_id = r.id_room
      WHERE 1=1
    `
    const params = []

    if (teacher_id) {
      sql += ' AND mc.teacher_id = ?'
      params.push(teacher_id)
    }

    if (status) {
      sql += ' AND mc.status = ?'
      params.push(status)
    }

    if (start_date) {
      sql += ' AND mc.makeup_date >= ?'
      params.push(start_date)
    }

    if (end_date) {
      sql += ' AND mc.makeup_date <= ?'
      params.push(end_date)
    }

    sql += ' ORDER BY mc.makeup_date, mc.makeup_time_start'

    const stmt = db.prepare(sql)
    const makeupClasses = stmt.all(...params)

    return makeupClasses
  }

  // POST - เพิ่มคลาสชดเชยใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    // Validate
    if (!body.original_date || !body.makeup_date || !body.teacher_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'original_date, makeup_date, and teacher_id are required'
      })
    }

    const stmt = db.prepare(`
      INSERT INTO makeup_classes (
        original_date, original_time_slot, makeup_date,
        makeup_time_start, makeup_time_end,
        teacher_id, section_id, subject_id, room_id,
        status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      body.original_date,
      body.original_time_slot || '',
      body.makeup_date,
      body.makeup_time_start || '',
      body.makeup_time_end || '',
      body.teacher_id,
      body.section_id || null,
      body.subject_id || null,
      body.room_id || null,
      body.status || 'suggested',
      body.notes || null
    )

    return {
      id_makeup: result.lastInsertRowid,
      ...body,
      created_at: new Date().toISOString()
    }
  }
})
