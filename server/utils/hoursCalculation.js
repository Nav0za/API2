import db from './db.js'

/**
 * คำนวณชั่วโมงที่ถูกใช้งานไปแล้วแยกตาม ทฤษฎี (theory) และ ปฏิบัติ (practical) สำหรับแต่ละรายวิชาใน section
 * 
 * @param {number} sectionId 
 * @param {string} term 
 * @returns {Record<string, { theory: number, practical: number, unknown: number }>} - Mapping of subjectId -> hours used
 */
export function getSectionSubjectHoursUsed(sectionId, term) {
  const record = db.prepare('SELECT scheduleData FROM section_schedules WHERE id_section = ? AND term = ?').get(sectionId, term)
  const usage = {}

  if (!record || !record.scheduleData) {
    return usage
  }

  const scheduleData = JSON.parse(record.scheduleData)

  for (let d = 0; d < 7; d++) {
    for (let s = 0; s < 13; s++) {
      const slot = scheduleData[d][s]
      if (slot && slot.value && typeof slot === 'object') {
        const valStr = String(slot.value)
        if (!usage[valStr]) {
          usage[valStr] = { theory: 0, practical: 0, unknown: 0 }
        }

        if (slot.type === 'theory') {
          usage[valStr].theory += 1
        } else if (slot.type === 'practical') {
          usage[valStr].practical += 1
        } else {
          usage[valStr].unknown += 1
        }
      }
    }
  }

  return usage
}
