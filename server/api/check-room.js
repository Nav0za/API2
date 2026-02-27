import db from '../utils/db.js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { room_id, date, start_time, end_time, term, current_makeup_id } = query

    // Validate parameters
    if (!date || !start_time || !end_time || !term) {
        throw createError({
            statusCode: 400,
            statusMessage: 'date, start_time, end_time, and term are required'
        })
    }

    // If no room is selected, it's always available
    if (!room_id || room_id === 'null' || room_id === 'undefined') {
        return { available: true }
    }

    try {
        const roomId = parseInt(room_id)
        const targetDate = new Date(date)
        const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = Monday ... 6 = Sunday

        // Helper: Convert time string like '13:00' to a comparable value (minutes since midnight)
        const timeToMinutes = (timeStr) => {
            if (!timeStr) return 0
            const [hours, minutes] = timeStr.split(':').map(Number)
            return (hours * 60) + (minutes || 0)
        }

        const startMinutes = timeToMinutes(start_time)
        const endMinutes = timeToMinutes(end_time)

        // Helper: Convert minute value to slot index
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


        // 1. Check Makeup Classes (Are there other makeups in this room at this time?)
        // We only care about active makeup classes on the exact same date
        let makeupQuery = `
      SELECT id_makeup, makeup_time_start, makeup_time_end, t.name as teacher_name 
      FROM makeup_classes mc
      LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
      WHERE mc.room_id = ? 
        AND mc.makeup_date = ? 
        AND mc.status != 'cancelled'
    `
        const makeupParams = [roomId, date]

        // If editing, exclude the current makeup block (could be multiple IDs if grouped)
        if (current_makeup_id) {
            // current_makeup_id could be a single ID or comma separated
            const ids = String(current_makeup_id).split(',').map(id => id.trim())
            makeupQuery += ` AND mc.id_makeup NOT IN (${ids.map(() => '?').join(',')})`
            makeupParams.push(...ids)
        }

        const existingMakeups = db.prepare(makeupQuery).all(...makeupParams)

        for (const makeup of existingMakeups) {
            if (!makeup.makeup_time_start || !makeup.makeup_time_end) continue
            const mStart = timeToMinutes(makeup.makeup_time_start)
            const mEnd = timeToMinutes(makeup.makeup_time_end)

            // Time Overlap Logic:
            // Overlaps if: (RequestedStart < ExistingEnd) AND (RequestedEnd > ExistingStart)
            if (startMinutes < mEnd && endMinutes > mStart) {
                return {
                    available: false,
                    reason: `มีสอนชดเชยของ ${makeup.teacher_name || 'อาจารย์ท่านอื่น'} ในเวลา ${makeup.makeup_time_start} - ${makeup.makeup_time_end}`
                }
            }
        }


        // 2. Check Regular Schedules
        // We need to check all section and teacher schedules to see if this room is used on this day/time
        // (In this system, a regular class is defined by having a subject ID in the schedule slot)

        // Check Teacher Schedules for this room
        const teacherSchedules = db.prepare(`SELECT id_teacher, name, scheduleData FROM schedules WHERE term = ?`).all(term)

        for (const ts of teacherSchedules) {
            if (!ts.scheduleData) continue
            try {
                const schedule = JSON.parse(ts.scheduleData)
                if (!schedule[dayIndex]) continue

                // Check only the requested slots
                for (const slotIdx of requestedSlots) {
                    const slot = schedule[dayIndex][slotIdx]
                    // A slot is "occupied" if it has a value (subject ID) AND the room matches the requested room
                    if (slot && slot.value && slot.value !== 'null') {
                        // If the slot has a specific room assigned (based on new multi-room feature logic), check it
                        // Or if we need to query the subject's default room.
                        // In earlier phases we added room_id to Subjects, and later flexible rooms in slots.
                        let classUsesRoom = false

                        if (slot.room_id) {
                            if (Number(slot.room_id) === Number(roomId)) classUsesRoom = true
                        } else {
                            // Fallback to subject's default room
                            const subject = db.prepare('SELECT id_room, name_subject FROM Subjects WHERE id_subject = ?').get(slot.value)
                            if (subject && Number(subject.id_room) === Number(roomId)) classUsesRoom = true
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

        // Since teacher schedules theoretically perfectly mirror section schedules (due to scheduleSync),
        // checking teacher schedules might be sufficient. But for safety we could check section schedules too.
        // However, if a teacher is teaching in room X, that's enough to block it.

        return {
            available: true
        }

    } catch (error) {
        console.error('Error checking room availability:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to check room availability'
        })
    }
})
