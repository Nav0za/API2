import db from './db.js'

/**
 * หาช่วงว่างสำหรับสอนชดเชย
 * @param {number} teacherId - ID ของอาจารย์
 * @param {string} missedDate - วันที่ขาดสอน (YYYY-MM-DD)
 * @param {string} term - เทอม (เช่น "1/68")
 * @returns {Array} รายการช่วงว่างที่แนะนำ
 */
// Helper to check if a slot is free (null or empty string)
function isSlotFree(slot) {
  return !slot || !slot.value || slot.value === 'null'
}

/**
 * หาช่วงว่างสำหรับสอนชดเชย
 * @param {number} teacherId - ID ของอาจารย์
 * @param {string} missedDate - วันที่ขาดสอน (YYYY-MM-DD)
 * @param {string} term - เทอม (เช่น "1/68")
 * @returns {Array} รายการช่วงว่างที่แนะนำ
 */
export async function findAvailableSlots(teacherId, missedDate, term) {
  // 1. ดึงตารางสอนของอาจารย์ในวันที่ขาด
  const teacherSchedule = getTeacherSchedule(teacherId, term)
  if (!teacherSchedule) return []

  const missedClasses = getClassesOnDate(teacherSchedule, missedDate)

  if (missedClasses.length === 0) {
    return [] // ไม่มีคลาสที่ขาด
  }

  // เตรียมข้อมูลวันหยุดและวันลาของอาจารย์
  const startDate = new Date(missedDate)
  startDate.setDate(startDate.getDate() + 1) // เริ่มหาตั้งแต่วันถัดไป

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 30) // หาล่วงหน้า 30 วัน (เผื่อไว้)

  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)

  // ดึง Events ที่เกี่ยวข้อง
  const events = db.prepare(`
    SELECT start, end, event_type, teacher_id 
    FROM calendar_events 
    WHERE (start BETWEEN ? AND ?) 
      AND (
        event_type = 'holiday' 
        OR (event_type = 'teacher_absence' AND teacher_id = ?)
      )
  `).all(startStr, endStr, teacherId)

  // Map วันที่ไม่ว่าง (YYYY-MM-DD)
  const busyDates = new Set()
  for (const event of events) {
    // กรณีวันเดียว
    busyDates.add(event.start)
    // กรณีหลายวัน (ถ้ามี)
    if (event.start !== event.end) {
      let curr = new Date(event.start)
      const end = new Date(event.end)
      while (curr <= end) {
        busyDates.add(formatDate(curr))
        curr.setDate(curr.getDate() + 1)
      }
    }
  }

  // 2. หาวันถัดไปที่ทั้งอาจารย์และนักศึกษาว่าง
  const suggestions = []

  // ค้นหาสูงสุด 14 วัน
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(startDate)
    checkDate.setDate(checkDate.getDate() + i)

    const dateStr = formatDate(checkDate)

    // Check if Holiday or Teacher Absence
    if (busyDates.has(dateStr)) {
      continue // ข้ามวันนี้ไปเลย
    }

    const dayOfWeek = checkDate.getDay() // 0=อาทิตย์, 1=จันทร์, ...

    // ข้ามถ้าเป็นวันเสาร์-อาทิตย์ (ถ้าต้องการ)
    // if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // เช็คแต่ละคลาสที่ขาด
    for (const missedClass of missedClasses) {
      if (!missedClass.sectionId) continue; // ถ้าไม่รู้นักเรียนกลุ่มไหน ก็หาไม่ได้

      const slots = findSlotsForClass(
        teacherId,
        missedClass.sectionId,
        missedClass.duration,
        dayOfWeek,
        dateStr,
        term
      )

      suggestions.push(...slots.map(slot => ({
        ...slot,
        missedDate,
        missedClass: missedClass.subjectName,
        sectionName: missedClass.sectionName,
        subjectId: missedClass.subjectId,
        sectionId: missedClass.sectionId
      })))
    }

    // หยุดถ้าเจอคำแนะนำมากกว่า 10 แล้ว
    if (suggestions.length >= 10) break
  }

  return suggestions
}

/**
 * ดึงตารางสอนของอาจารย์
 */
function getTeacherSchedule(teacherId, term) {
  const stmt = db.prepare(`
    SELECT scheduleData FROM schedules 
    WHERE id_teacher = ? AND term = ?
  `)
  const result = stmt.get(teacherId, term)

  if (!result || !result.scheduleData) return null
  try {
    return JSON.parse(result.scheduleData)
  } catch (e) {
    console.error('Error parsing teacher schedule:', e)
    return null
  }
}

/**
 * ดึงรายวิชาที่อาจารย์สอนในวันที่กำหนด (วันที่ขาดสอน)
 */
function getClassesOnDate(schedule, dateStr) {
  if (!schedule) return []

  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 0=อาทิตย์, 1=จันทร์
  // แปลง dayOfWeek เป็น index ของตาราง (0=จันทร์, ..., 6=อาทิตย์)
  // แต่ JS getDay(): 0=Sun, 1=Mon. 
  // สมมติ array เรียง: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  // Mon(1) -> 0
  // Sun(0) -> 6
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  if (!schedule[dayIndex]) return []

  const classes = []
  const daySchedule = schedule[dayIndex] // Array of slots

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
          classes.push(createClassObj(currentSubject, startSlot, duration))
        }

        // เริ่มวิชาใหม่
        currentSubject = valStr
        startSlot = i
        duration = 1
      }
    } else {
      // เจอช่องว่าง
      if (currentSubject) {
        classes.push(createClassObj(currentSubject, startSlot, duration))
        currentSubject = null
      }
    }
  }

  // เก็บตกตัวสุดท้าย
  if (currentSubject) {
    classes.push(createClassObj(currentSubject, startSlot, duration))
  }

  return classes
}

function createClassObj(subjectId, startSlot, duration) {
  const sectionId = getSectionForSubject(subjectId)
  return {
    subjectId,
    subjectName: getSubjectName(subjectId),
    sectionId,
    sectionName: getSectionName(sectionId),
    startSlot,
    duration,
    timeStart: getTimeFromSlot(startSlot),
    timeEnd: getTimeFromSlot(startSlot + duration)
  }
}

/**
 * หาช่วงว่างสำหรับคลาสที่ต้องชดเชย
 */
function findSlotsForClass(teacherId, sectionId, duration, dayOfWeek, dateStr, term) {
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // 1. ดึงตารางอาจารย์
  const teacherSchedule = getTeacherSchedule(teacherId, term)
  if (!teacherSchedule || !teacherSchedule[dayIndex]) return []

  // 2. ดึงตารางนักศึกษา
  const sectionSchedule = getSectionSchedule(sectionId, term)
  // ถ้าไม่มีตารางนักศึกษา ให้ถือว่าว่าง? หรือถือว่าไม่ว่าง? 
  // ปกติถ้าไม่มีตารางแปลว่ายังไม่ได้จัด ควร assume ว่าว่างไปก่อน หรือ return []
  // เพื่อความชัวร์ ถ้าไม่มีตาราง section ให้ assume ว่าว่าง แต่แจ้งเตือน
  const secDaySchedule = sectionSchedule ? sectionSchedule[dayIndex] : Array(13).fill({ value: null })

  const availableSlots = []
  const maxSlots = 13 // สมมติมี 13 คาบ (0-12)

  // วนลูปหาช่วงว่างที่ยาวพอ (duration)
  // i คือ slot เริ่มต้น
  for (let i = 0; i <= maxSlots - duration; i++) {
    let checkPass = true

    // เช็คต่อเนื่อง j ชั่วโมง
    for (let j = 0; j < duration; j++) {
      const slotIdx = i + j

      // ยกเว้นเวลาพักกลางวัน (คาบที่ 5, index 4)
      if (slotIdx === 4) {
        checkPass = false
        break
      }

      // 1. เช็คอาจารย์
      const teacherSlot = teacherSchedule[dayIndex][slotIdx]
      if (!isSlotFree(teacherSlot)) {
        checkPass = false
        break
      }

      // 2. เช็คนักเรียน
      const sectionSlot = secDaySchedule[slotIdx]
      if (!isSlotFree(sectionSlot)) {
        checkPass = false
        break
      }
    }

    if (checkPass) {
      availableSlots.push({
        date: dateStr,
        dayOfWeek: getDayName(dayOfWeek),
        startSlot: i,
        duration,
        timeStart: getTimeFromSlot(i),
        timeEnd: getTimeFromSlot(i + duration)
      })
    }
  }

  return availableSlots
}

/**
 * ดึงตารางเรียนของกลุ่มนักศึกษา
 */
function getSectionSchedule(sectionId, term) {
  const stmt = db.prepare(`
    SELECT scheduleData FROM section_schedules 
    WHERE id_section = ? AND term = ?
  `)
  const result = stmt.get(sectionId, term)

  if (!result || !result.scheduleData) return null
  try {
    return JSON.parse(result.scheduleData)
  } catch (e) {
    return null
  }
}

/**
 * ดึงชื่อวิชา
 */
function getSubjectName(subjectId) {
  const stmt = db.prepare('SELECT name_subject FROM Subjects WHERE id_subject = ?')
  const result = stmt.get(subjectId)
  return result?.name_subject || 'ไม่ทราบชื่อวิชา'
}

/**
 * หา section ที่เรียนวิชานี้
 */
function getSectionForSubject(subjectId) {
  const stmt = db.prepare('SELECT id_section FROM Subjects WHERE id_subject = ?')
  const result = stmt.get(subjectId)
  return result?.id_section || null
}

/**
 * ดึงชื่อกลุ่มเรียน
 */
function getSectionName(sectionId) {
  if (!sectionId) return 'ไม่ระบุกลุ่ม'

  const stmt = db.prepare('SELECT section_name FROM sections WHERE id_section = ?')
  const result = stmt.get(sectionId)
  return result?.section_name || 'ไม่ทราบกลุ่ม'
}

/**
 * แปลง slot index เป็นเวลา
 */
function getTimeFromSlot(slotIndex) {
  const times = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ]

  if (slotIndex < 0 || slotIndex >= times.length) return '??:??'
  return times[slotIndex]
}

/**
 * แปลง day number เป็นชื่อวัน
 */
function getDayName(dayOfWeek) {
  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  return days[dayOfWeek] || '??'
}

/**
 * Format date เป็น YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * หาช่วงว่างสำหรับสอนชดเชยหลายวิชาพร้อมกัน
 * @param {number} teacherId - ID ของอาจารย์
 * @param {string} missedDate - วันที่ขาดสอน (YYYY-MM-DD)
 * @param {string} term - เทอม
 * @param {Array} classes - รายการวิชา [{subjectId, sectionId, duration}, ...]
 * @returns {Array} รายการช่วงว่างที่แนะนำ
 */
export async function findAvailableSlotsForMultipleClasses(teacherId, missedDate, term, classes) {
  if (!classes || classes.length === 0) {
    return []
  }

  const totalDuration = classes.reduce((sum, c) => sum + c.duration, 0)
  const allSectionIds = [...new Set(classes.map(c => c.sectionId).filter(Boolean))]

  // เตรียมข้อมูลวันหยุดและวันลาของอาจารย์
  const startDate = new Date(missedDate)
  startDate.setDate(startDate.getDate() + 1)

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 30)

  const startStr = formatDate(startDate)
  const endStr = formatDate(endDate)

  // ดึง Events ที่เกี่ยวข้อง
  const events = db.prepare(`
    SELECT start, end, event_type, teacher_id 
    FROM calendar_events 
    WHERE (start BETWEEN ? AND ?) 
      AND (
        event_type = 'holiday' 
        OR (event_type = 'teacher_absence' AND teacher_id = ?)
      )
  `).all(startStr, endStr, teacherId)

  const busyDates = new Set()
  for (const event of events) {
    busyDates.add(event.start)
    if (event.start !== event.end) {
      let curr = new Date(event.start)
      const end = new Date(event.end)
      while (curr <= end) {
        busyDates.add(formatDate(curr))
        curr.setDate(curr.getDate() + 1)
      }
    }
  }

  const suggestions = []

  // ค้นหาสูงสุด 14 วัน
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(startDate)
    checkDate.setDate(checkDate.getDate() + i)

    const dateStr = formatDate(checkDate)

    // Check if Holiday or Teacher Absence
    if (busyDates.has(dateStr)) {
      continue
    }

    const dayOfWeek = checkDate.getDay()
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    // หาช่วงว่างที่ยาว totalDuration ชั่วโมง
    const slots = findContinuousFreeSlots(
      teacherId,
      allSectionIds,
      totalDuration,
      dayIndex,
      dateStr,
      term
    )

    suggestions.push(...slots.map(slot => ({
      ...slot,
      missedDate,
      classes: classes.map(c => ({
        subjectId: c.subjectId,
        subjectName: getSubjectName(c.subjectId),
        sectionId: c.sectionId,
        sectionName: getSectionName(c.sectionId),
        duration: c.duration
      }))
    })))

    if (suggestions.length >= 10) break
  }

  return suggestions
}

/**
 * หาช่วงว่างติดกันที่ยาวพอสำหรับหลายวิชา
 */
function findContinuousFreeSlots(teacherId, sectionIds, duration, dayIndex, dateStr, term) {
  const teacherSchedule = getTeacherSchedule(teacherId, term)
  if (!teacherSchedule || !teacherSchedule[dayIndex]) return []

  const sectionSchedules = sectionIds.map(id => getSectionSchedule(id, term)).filter(Boolean)

  const availableSlots = []
  const maxSlots = 13

  for (let i = 0; i <= maxSlots - duration; i++) {
    let allFree = true

    // เช็คทุกช่วงเวลาติดกัน
    for (let j = 0; j < duration; j++) {
      const slotIdx = i + j

      // ยกเว้นเวลาพักกลางวัน (คาบที่ 5, index 4)
      if (slotIdx === 4) {
        allFree = false
        break
      }

      // เช็คอาจารย์
      const teacherSlot = teacherSchedule[dayIndex][slotIdx]
      if (!isSlotFree(teacherSlot)) {
        allFree = false
        break
      }

      // เช็คทุก section
      for (const secSchedule of sectionSchedules) {
        if (!secSchedule[dayIndex]) continue
        const sectionSlot = secSchedule[dayIndex][slotIdx]
        if (!isSlotFree(sectionSlot)) {
          allFree = false
          break
        }
      }

      if (!allFree) break
    }

    if (allFree) {
      const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1
      availableSlots.push({
        date: dateStr,
        dayOfWeek: getDayName(dayOfWeek),
        startSlot: i,
        duration,
        timeStart: getTimeFromSlot(i),
        timeEnd: getTimeFromSlot(i + duration)
      })
    }
  }

  return availableSlots
}
