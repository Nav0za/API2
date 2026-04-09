import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { date, term } = query

  if (!date) {
    throw createError({
      statusCode: 400,
      statusMessage: 'date is required'
    })
  }

  try {
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay() // 0 = Sunday, 1 = Monday
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // 0 = Mon ... 6 = Sun

    // Calculate times to match database structure
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

    // 1. Fetch all rooms
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY room_name').all()
    const roomSchedules = {}

    // Initialize 14 slots for each room
    for (const room of rooms) {
      roomSchedules[room.id_room] = {
        ...room,
        slots: Array(14).fill(null) // null means free. We will populate with occupancy objects.
      }
    }

    // 2. Fetch Makeup Classes for the specific date
    const makeupClasses = db.prepare(`
      SELECT mc.id_makeup, mc.makeup_time_start, mc.makeup_time_end, mc.room_id,
             t.prefix, t.first_name, t.last_name, sub.name_subject as subject_name
      FROM makeup_classes mc
      LEFT JOIN teachers t ON mc.teacher_id = t.id_teacher
      LEFT JOIN Subjects sub ON mc.subject_id = sub.id_subject
      WHERE mc.makeup_date = ? AND mc.status != 'cancelled' AND mc.room_id IS NOT NULL
    `).all(date)

    for (const makeup of makeupClasses) {
      if (!roomSchedules[makeup.room_id]) continue // Skip if room was deleted or unmapped

      const slotsOccupied = getSlotIndexes(makeup.makeup_time_start, makeup.makeup_time_end)
      for (const slotIdx of slotsOccupied) {
        roomSchedules[makeup.room_id].slots[slotIdx] = {
          type: 'makeup',
          teacherName: [makeup.prefix, makeup.first_name, makeup.last_name].filter(Boolean).join(' ').trim(),
          subjectName: makeup.subject_name || 'ชดเชยพิเศษ',
          timeStart: makeup.makeup_time_start,
          timeEnd: makeup.makeup_time_end
        }
      }
    }

    // 3. Fetch Regular Teacher Schedules (Since Teacher Schedules are synced with Section Schedules)
    let teacherSchedules = []
    
    let activeTermStr = term
    if (!activeTermStr) {
      const activeTerm = db.prepare('SELECT term, academic_year FROM terms WHERE ? >= start_date AND ? <= end_date').get(date, date)
      if (activeTerm) {
        activeTermStr = `${activeTerm.term}/${activeTerm.academic_year}`
      }
    }

    if (activeTermStr) {
      teacherSchedules = db.prepare(`
              SELECT s.id_teacher, t.prefix, t.first_name, t.last_name, s.scheduleData 
              FROM schedules s
              LEFT JOIN teachers t ON s.id_teacher = t.id_teacher
              WHERE s.term = ?
          `).all(activeTermStr)
    }

    // Lookup table for subjects to get their default rooms
    const subjectsRaw = db.prepare('SELECT id_subject, name_subject FROM Subjects').all()
    const subjectData = {}
    subjectsRaw.forEach((s) => {
      subjectData[s.id_subject] = {
        name: s.name_subject
      }
    })

    // Loop through all teachers to plot their classes on the room schedules
    for (const ts of teacherSchedules) {
      if (!ts.scheduleData) continue
      try {
        const schedule = JSON.parse(ts.scheduleData)
        if (!schedule[dayIndex]) continue // Teacher doesn't teach on this day

        const dailySlots = schedule[dayIndex]
        for (let slotIdx = 0; slotIdx < dailySlots.length; slotIdx++) {
          const slot = dailySlots[slotIdx]

          if (slot && slot.value && slot.value !== 'null') {
            const subjectId = slot.value
            const subjectInfo = subjectData[subjectId]

            // Determine Room ID (Priority: Explicitly assigned in slot > Unassigned)
            let assignedRoomId = slot.room_id ? Number(slot.room_id) : null

            // If a valid room is found, map it to the grid
            if (assignedRoomId && roomSchedules[assignedRoomId]) {
              // Only overwrite if it's currently free, or if we want regular class to show under makeups?
              // Usually makeup classes override regular classes on the target day. We will only map if slot is currently null.
              if (!roomSchedules[assignedRoomId].slots[slotIdx] || roomSchedules[assignedRoomId].slots[slotIdx].type === 'regular') {
                roomSchedules[assignedRoomId].slots[slotIdx] = {
                  type: 'regular',
                  teacherName: [ts.prefix, ts.first_name, ts.last_name].filter(Boolean).join(' ').trim(),
                  subjectName: subjectInfo ? subjectInfo.name : subjectId,
                  // Note: regular slots are usually 1 hr blocks in this representation
                  timeStart: times[slotIdx],
                  timeEnd: slotIdx + 1 < times.length ? times[slotIdx + 1] : '22:00'
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing teacher schedule:', e)
      }
    }

    // Convert object back to array
    const sortedRooms = Object.values(roomSchedules).sort((a, b) => a.room_name.localeCompare(b.room_name))

    return {
      success: true,
      data: sortedRooms
    }
  } catch (error) {
    console.error('Error fetching room schedules:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch room schedules'
    })
  }
})
