import db from './db.js'
import Holidays from 'date-holidays'

const hd = new Holidays('TH', { languages: ['th', 'en'] })

/**
 * Checks if a specific date is a holiday.
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Object|null} Holiday event if found, else null.
 */
export function getHolidayOnDate(date) {
    // 1. Check Database (Manually added holidays)
    const stmt = db.prepare(`
        SELECT * FROM calendar_events 
        WHERE event_type = 'holiday' 
        AND date(start) <= ? AND date(end) >= ?
    `)
    const dbHoliday = stmt.get(date, date)
    if (dbHoliday) return dbHoliday

    // 2. Check Official Thai Holidays (date-holidays library)
    const holidays = hd.getHolidays(new Date(date).getFullYear())
    const officialHoliday = holidays.find(h => h.date.split(' ')[0] === date)

    if (officialHoliday) {
        return {
            title: officialHoliday.name
        }
    }

    return null
}

/**
 * Checks if a room is available at a specific date and time.
 * @param {Object} params - { room_id, date, start_time, end_time, term, exclude_makeup_ids }
 * @returns {Object} { available: boolean, reason: string|null }
 */
export function checkRoomAvailability({ room_id, date, start_time, end_time, term, exclude_makeup_ids = [] }) {
    if (!room_id || room_id === 'null' || room_id === 'undefined') {
        return { available: true }
    }

    const roomId = parseInt(room_id)
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = Monday ... 6 = Sunday

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0
        const [hours, minutes] = timeStr.split(':').map(Number)
        return (hours * 60) + (minutes || 0)
    }

    const startMinutes = timeToMinutes(start_time)
    const endMinutes = timeToMinutes(end_time)

    const times = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
    ]

    const getSlotIndexes = (start, end) => {
        const slots = []
        const sIdx = times.indexOf(start)
        const eIdx = times.indexOf(end)
        if (sIdx === -1 || eIdx === -1) return []
        for (let i = sIdx; i < eIdx; i++) slots.push(i)
        return slots
    }
    const requestedSlots = getSlotIndexes(start_time, end_time)

    // 1. Check Makeup Classes (exclude cancelled AND pending - pending have null dates from rescheduling)
    let makeupQuery = `
        SELECT id_makeup, makeup_time_start, makeup_time_end, t.name as teacher_name 
        FROM makeup_classes mc
        LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
        WHERE mc.room_id = ? 
          AND mc.makeup_date = ? 
          AND mc.status NOT IN ('cancelled', 'pending')
    `
    const makeupParams = [roomId, date]

    if (exclude_makeup_ids && exclude_makeup_ids.length > 0) {
        makeupQuery += ` AND mc.id_makeup NOT IN (${exclude_makeup_ids.map(() => '?').join(',')})`
        makeupParams.push(...exclude_makeup_ids)
    }

    const existingMakeups = db.prepare(makeupQuery).all(...makeupParams)

    for (const makeup of existingMakeups) {
        if (!makeup.makeup_time_start || !makeup.makeup_time_end) continue
        const mStart = timeToMinutes(makeup.makeup_time_start)
        const mEnd = timeToMinutes(makeup.makeup_time_end)

        if (startMinutes < mEnd && endMinutes > mStart) {
            return {
                available: false,
                reason: `มีสอนชดเชยของ ${makeup.teacher_name || 'อาจารย์ท่านอื่น'} ในเวลา ${makeup.makeup_time_start} - ${makeup.makeup_time_end}`
            }
        }
    }

    // 2. Check Regular Schedules
    const teacherSchedules = db.prepare(`
        SELECT s.id_teacher, t.name, s.scheduleData 
        FROM schedules s
        LEFT JOIN teachers t ON s.id_teacher = t.id_teacher
        WHERE s.term = ?
    `).all(term)

    for (const ts of teacherSchedules) {
        if (!ts.scheduleData) continue
        try {
            const schedule = JSON.parse(ts.scheduleData)
            if (!schedule[dayIndex]) continue

            for (const slotIdx of requestedSlots) {
                const slot = schedule[dayIndex][slotIdx]
                if (slot && slot.value && slot.value !== 'null') {
                    let classUsesRoom = false
                    if (slot.room_id) {
                        if (Number(slot.room_id) === Number(roomId)) classUsesRoom = true
                    }

                    if (classUsesRoom) {
                        const subject = db.prepare('SELECT name_subject FROM Subjects WHERE id_subject = ?').get(slot.value)
                        return {
                            available: false,
                            reason: `ตรงกับตารางเรียนปกติ (วิชา ${subject?.name_subject || slot.value}) สอนโดย ${ts.name}`
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing teacher schedule for room check', e)
        }
    }

    return { available: true }
}
