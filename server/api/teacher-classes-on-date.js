import db from '../utils/db.js'

/**
 * ดึงรายการวิชาที่อาจารย์สอนในวันที่กำหนด
 * Query params:
 * - teacher_id: ID ของอาจารย์
 * - date: วันที่ (YYYY-MM-DD)
 * - term: เทอม (เช่น "1/68")
 */
export default defineEventHandler(async (event) => {
    const { teacher_id, date, term } = getQuery(event)

    if (!teacher_id || !date || !term) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required parameters: teacher_id, date, term'
        })
    }

    // ดึงตารางสอนของอาจารย์
    const scheduleStmt = db.prepare(`
    SELECT scheduleData FROM schedules 
    WHERE id_teacher = ? AND term = ?
  `)
    const scheduleResult = scheduleStmt.get(teacher_id, term)

    console.log('[teacher-classes-on-date] Query:', { teacher_id, date, term })
    console.log('[teacher-classes-on-date] Schedule result:', scheduleResult)

    if (!scheduleResult || !scheduleResult.scheduleData) {
        console.log('[teacher-classes-on-date] No schedule found')
        return []
    }

    let schedule
    try {
        schedule = JSON.parse(scheduleResult.scheduleData)
    } catch (e) {
        console.error('Error parsing schedule:', e)
        return []
    }

    // หาวันในสัปดาห์
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay() // 0=Sun, 1=Mon, ...
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // แปลงเป็น 0=Mon, ..., 6=Sun

    if (!schedule[dayIndex]) {
        return []
    }

    const daySchedule = schedule[dayIndex]
    const classes = []

    // นับจำนวนชั่วโมงติดต่อกันของแต่ละวิชา
    let currentSubject = null
    let startSlot = 0
    let duration = 0

    for (let i = 0; i < daySchedule.length; i++) {
        const slot = daySchedule[i]
        const slotValue = slot?.value

        // แปลงเป็น String เพื่อความชัวร์ในการเปรียบเทียบ (null/undefined จะกลายเป็น "null"/"undefined")
        const valStr = slotValue ? String(slotValue) : null

        if (valStr) {
            // ถ้าเป็นวิชาเดิม
            if (valStr === currentSubject) {
                duration++
            } else {
                // จบวิชาก่อนหน้า
                if (currentSubject) {
                    classes.push(createClassObj(currentSubject, startSlot, duration, teacher_id, date))
                }

                // เริ่มวิชาใหม่
                currentSubject = valStr
                startSlot = i
                duration = 1
            }
        } else {
            // เจอช่องว่าง
            if (currentSubject) {
                classes.push(createClassObj(currentSubject, startSlot, duration, teacher_id, date))
                currentSubject = null
            }
        }
    }

    // เก็บตกตัวสุดท้าย
    if (currentSubject) {
        classes.push(createClassObj(currentSubject, startSlot, duration, teacher_id, date))
    }

    console.log('[teacher-classes-on-date] Merged classes:', classes)
    return classes
})

function createClassObj(subjectId, startSlot, duration, teacherId, date) {
    const sectionId = getSectionForSubject(subjectId)

    let hasMakeup = false
    if (teacherId && date) {
        const makeupStmt = db.prepare(`
            SELECT id_makeup FROM makeup_classes 
            WHERE teacher_id = ? AND subject_id = ? AND original_date = ? AND status != 'cancelled'
            LIMIT 1
        `)
        const makeupRecord = makeupStmt.get(teacherId, subjectId, date)
        hasMakeup = !!makeupRecord
    }

    return {
        subjectId,
        subjectName: getSubjectName(subjectId),
        sectionId,
        sectionName: getSectionName(sectionId, subjectId),
        startSlot,
        duration,
        timeStart: getTimeFromSlot(startSlot),
        timeEnd: getTimeFromSlot(startSlot + duration),
        hasMakeup
    }
}

function getSubjectName(subjectId) {
    const stmt = db.prepare('SELECT name_subject FROM Subjects WHERE id_subject = ?')
    const result = stmt.get(subjectId)
    return result?.name_subject || 'ไม่ทราบชื่อวิชา'
}

function getSectionForSubject(subjectId) {
    const stmt = db.prepare('SELECT id_section FROM SubjectSections WHERE id_subject = ? LIMIT 1')
    const result = stmt.get(subjectId)
    if (result) return result.id_section

    const fallbackStmt = db.prepare('SELECT id_section FROM Subjects WHERE id_subject = ?')
    const fallbackResult = fallbackStmt.get(subjectId)
    return fallbackResult?.id_section || null
}

function getSectionName(sectionId, subjectId) {
    if (subjectId) {
        const stmt = db.prepare(`
            SELECT s.section_name 
            FROM sections s
            JOIN SubjectSections ss ON s.id_section = ss.id_section
            WHERE ss.id_subject = ?
        `)
        const results = stmt.all(subjectId)
        if (results && results.length > 0) {
            return results.map(r => r.section_name).join(', ')
        }
    }

    if (!sectionId) return 'ไม่ระบุกลุ่ม'

    const stmt = db.prepare('SELECT section_name FROM sections WHERE id_section = ?')
    const result = stmt.get(sectionId)
    return result?.section_name || 'ไม่ทราบกลุ่ม'
}

function getTimeFromSlot(slotIndex) {
    const times = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00'
    ]

    if (slotIndex < 0 || slotIndex >= times.length) return '??:??'
    return times[slotIndex]
}
