// server/api/calendar-events.js
import db from '../utils/db.js'
import Holidays from 'date-holidays'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { start: qStart, end: qEnd } = query

  // GET - ดึงข้อมูลกิจกรรมทั้งหมด
  if (event.node.req.method === 'GET') {
    // 1. ดึงข้อมูลจาก Database
    // ถ้ามีช่วงเวลา ให้กรองใน DB ด้วยเพื่อความรวดเร็ว
    let events
    if (qStart && qEnd) {
      events = db.prepare(`
        SELECT * FROM calendar_events 
        WHERE (start <= ? AND end >= ?) 
           OR (start >= ? AND start <= ?)
        ORDER BY start ASC
      `).all(qEnd, qStart, qStart, qEnd)
    } else {
      events = db.prepare(`
        SELECT * FROM calendar_events ORDER BY start ASC
      `).all()
    }

    const dbEvents = events.map(e => ({
      id: e.id_event,
      title: e.title,
      start: e.start,
      end: e.end,
      backgroundColor: e.background_color,
      borderColor: e.border_color,
      allDay: !!e.all_day,
      extendedProps: {
        eventType: e.event_type,
        teacherId: e.teacher_id,
        teacherName: e.teacher_name,
        description: e.description,
        originalDate: e.original_date,
        makeupClassIds: e.makeup_class_ids
      }
    }))

    // 2. ดึงข้อมูลวันหยุดราชการไทย (Dynamic ตามช่วงเวลาที่ขอมา)
    const hd = new Holidays('TH', { languages: ['th', 'en'] })

    // คำนวณปีที่ต้องดึงข้อมูล
    let targetYears = []
    if (qStart && qEnd) {
      const startYear = new Date(qStart).getFullYear()
      const endYear = new Date(qEnd).getFullYear()
      for (let y = startYear; y <= endYear; y++) {
        targetYears.push(y)
      }
    } else {
      const currentYear = new Date().getFullYear()
      targetYears = [currentYear - 1, currentYear, currentYear + 1]
    }

    const holidayData = []
    targetYears.forEach(y => {
      holidayData.push(...hd.getHolidays(y))
    })

    const holidays = holidayData
      .map(h => {
        const dateStr = h.date.split(' ')[0]
        return {
          id: `holiday-${h.name}-${dateStr}`,
          title: h.name,
          start: dateStr,
          end: dateStr,
          backgroundColor: '#f59e0b',
          borderColor: '#f59e0b',
          textColor: '#ffffff',
          allDay: true,
          extendedProps: {
            eventType: 'holiday',
            description: 'วันหยุดราชการ'
          }
        }
      })
      .filter(h => {
        // กรองเฉพาะที่อยู่ในช่วงที่ขอมา
        if (!qStart || !qEnd) return true
        return h.start >= qStart && h.start <= qEnd
      })

    // รวมข้อมูล
    return [...dbEvents, ...holidays]
  }

  // POST - เพิ่มกิจกรรมใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    const result = db.prepare(`
      INSERT INTO calendar_events 
      (title, start, end, background_color, border_color, teacher_id, teacher_name, description, event_type, all_day, original_date, makeup_class_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      body.title,
      body.start,
      body.end,
      body.backgroundColor,
      body.borderColor,
      body.extendedProps?.teacherId || null,
      body.extendedProps?.teacherName || null,
      body.extendedProps?.description || null,
      body.extendedProps?.eventType || 'normal',
      body.allDay ? 1 : 0,
      body.extendedProps?.originalDate || null,
      body.extendedProps?.makeupClassIds || null
    )

    return {
      id: result.lastInsertRowid,
      ...body
    }
  }
})
