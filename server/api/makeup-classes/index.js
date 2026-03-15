import db from '../../utils/db.js'
import { getHolidayOnDate, checkRoomAvailability } from '../../utils/availability.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { teacher_id, status, start_date, end_date } = query

  // GET - ดึงข้อมูลคลาสชดเชย
  if (event.node.req.method === 'GET') {
    let sql = `
      SELECT 
        mc.*,
        t.prefix,
        t.first_name,
        t.last_name,
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

    return makeupClasses.map(mc => ({
      ...mc,
      teacher_name: [mc.prefix, mc.first_name, mc.last_name].filter(Boolean).join(' ').trim()
    }))
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

    // 1. Check Holiday
    const holiday = getHolidayOnDate(body.makeup_date)
    if (holiday) {
      throw createError({
        statusCode: 400,
        statusMessage: `ไม่สามารถจัดสอนชดเชยในวันหยุดราชการได้ (${holiday.title})`
      })
    }

    // 2. Check Room Availability (if room_id is provided)
    if (body.room_id && body.room_id !== 'null') {
      // We need term for room check. If not provided, try to find teacher's current term.
      let term = body.term
      if (!term) {
        const teacherSchedule = db.prepare('SELECT term FROM schedules WHERE id_teacher = ? ORDER BY created_at DESC LIMIT 1').get(body.teacher_id)
        term = teacherSchedule?.term
      }

      if (term) {
        const excludeIds = Array.isArray(body.exclude_makeup_ids) ? body.exclude_makeup_ids : []
        const availability = checkRoomAvailability({
          room_id: body.room_id,
          date: body.makeup_date,
          start_time: body.makeup_time_start,
          end_time: body.makeup_time_end,
          term,
          exclude_makeup_ids: excludeIds
        })

        if (!availability.available) {
          throw createError({
            statusCode: 400,
            statusMessage: `ห้องไม่ว่าง: ${availability.reason}`
          })
        }
      }
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
      body.status || 'confirmed',
      body.notes || null
    )

    return {
      id_makeup: result.lastInsertRowid,
      ...body,
      created_at: new Date().toISOString()
    }
  }
})
