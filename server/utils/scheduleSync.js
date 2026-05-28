import db from './db.js'
import { isTeacherScheduleHiddenSubject } from './teacherScheduleVisibility.js'

/**
 * Normalizes subject IDs to numbers to avoid type mismatch in Set.has()
 */
function normalizeId(id) {
  if (id === null || id === undefined) return null
  const num = Number(id)
  return isNaN(num) ? id : num
}

function normalizeTeacherRef(ref) {
  if (ref === null || ref === undefined || ref === '') return null
  if (typeof ref === 'string' && ref.startsWith('ext:')) return ref
  const num = Number(ref)
  return Number.isFinite(num) ? num : null
}

function getInternalTeacherIdsFromSlot(slot, subjectId) {
  if (slot?.schedule_kind === 'internship' || isTeacherScheduleHiddenSubject(subjectId)) return []

  const teacherRefs = Array.isArray(slot?.teacher_ids) ? slot.teacher_ids : []
  const selected = [...new Set(teacherRefs.map(normalizeTeacherRef).filter(v => Number.isFinite(v)).map(Number))]
  if (selected.length > 0) return selected

  const subject = db.prepare(`
    SELECT id_teacher, id_plan_subject, curriculum_subject_id, external_teacher_name
    FROM Subjects
    WHERE id_subject = ?
  `).get(normalizeId(subjectId))

  if (!subject) return []
  if (subject.external_teacher_name) return []

  const baseKey = subject.id_plan_subject || subject.curriculum_subject_id
  if (baseKey == null) return []

  const rows = db.prepare(`
    SELECT DISTINCT id_teacher
    FROM Subjects
    WHERE (id_plan_subject = ? OR curriculum_subject_id = ?) AND id_teacher IS NOT NULL
  `).all(baseKey, baseKey)

  return [...new Set(rows.map(r => Number(r.id_teacher)).filter(Number.isFinite))]
}

/**
 * Synchronize teacher's schedule changes to affected sections.
 */
export function syncTeacherToSections(teacherId, term, newTeacherSchedule) {
  try {
    const tId = Number(teacherId)
    console.log(`[Sync] Teacher ${tId} -> Sections for term ${term}`)

    // 1. Get all subjects taught by this teacher and their sections
    const teacherSubjects = db.prepare(`
            SELECT s.id_subject, ss.id_section
            FROM Subjects s
            JOIN SubjectSections ss ON s.id_subject = ss.id_subject
            WHERE s.id_teacher = ?
        `).all(tId)

    const teacherSubjectIds = new Set(teacherSubjects.map(s => normalizeId(s.id_subject)))
    const affectedSectionIds = new Set(teacherSubjects.map(s => s.id_section).filter(id => id != null))

    // Subject to Sections mapping (subjectId -> Set of sectionIds)
    const subjectToSections = {}
    teacherSubjects.forEach((s) => {
      const sid = normalizeId(s.id_subject)
      if (!subjectToSections[sid]) subjectToSections[sid] = new Set()
      subjectToSections[sid].add(s.id_section)
    })

    // 2. Update each affected section
    for (const sectionId of affectedSectionIds) {
      const secSchedRecord = db.prepare('SELECT id_section_schedule, scheduleData FROM section_schedules WHERE id_section = ? AND term = ?').get(sectionId, term)

      let sectionScheduleData
      if (secSchedRecord) {
        sectionScheduleData = JSON.parse(secSchedRecord.scheduleData)
      } else {
        sectionScheduleData = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null, type: null, schedule_kind: 'lesson', section_ids: [], teacher_ids: [] })))
      }

      let modified = false
      for (let d = 0; d < 7; d++) {
        for (let s = 0; s < 13; s++) {
          const teacherVal = normalizeId(newTeacherSchedule[d][s]?.value)
          const sectionVal = normalizeId(sectionScheduleData[d][s]?.value)

          // Case A: This slot in Teacher's schedule has a subject that includes THIS section
          // AND this section is explicitly selected for this slot (or no specific sections selected = default to all)
          const slotSections = newTeacherSchedule[d][s]?.section_ids
          const isSectionActive = !slotSections || (Array.isArray(slotSections) && (slotSections.length === 0 || slotSections.includes(Number(sectionId))))

          if (teacherVal && teacherSubjectIds.has(teacherVal) && subjectToSections[teacherVal].has(normalizeId(sectionId)) && isSectionActive) {
            const teacherRoom = newTeacherSchedule[d][s]?.room_id || null
            const teacherType = newTeacherSchedule[d][s]?.type || null
            let sectionTeacherIds = Array.isArray(sectionScheduleData[d][s].teacher_ids) ? sectionScheduleData[d][s].teacher_ids : []
            if (!sectionTeacherIds.includes(Number(tId))) {
              sectionTeacherIds = [...sectionTeacherIds, Number(tId)]
            }
            if (
              sectionVal !== teacherVal
              || sectionScheduleData[d][s].room_id !== teacherRoom
              || sectionScheduleData[d][s].type !== teacherType
              || JSON.stringify(sectionScheduleData[d][s].teacher_ids || []) !== JSON.stringify(sectionTeacherIds)
            ) {
              sectionScheduleData[d][s].value = teacherVal
              sectionScheduleData[d][s].room_id = teacherRoom
              sectionScheduleData[d][s].type = teacherType
              sectionScheduleData[d][s].teacher_ids = sectionTeacherIds
              modified = true
            }
          }
          // Case B: This slot in Section's schedule CURRENTLY contains one of this teacher's subjects,
          // but the Teacher's schedule doesn't have it here anymore (or has something else).
          else if (sectionVal && teacherSubjectIds.has(sectionVal)) {
            // If we are here, Case A failed, meaning teacher schedule doesn't have THIS subject here for THIS section.
            let sectionTeacherIds = Array.isArray(sectionScheduleData[d][s].teacher_ids) ? sectionScheduleData[d][s].teacher_ids : []
            if (sectionTeacherIds.includes(Number(tId))) {
              sectionTeacherIds = sectionTeacherIds.filter(id => Number(id) !== Number(tId))
              sectionScheduleData[d][s].teacher_ids = sectionTeacherIds

              // If no teachers left, clear the whole slot for the section
              if (sectionTeacherIds.length === 0) {
                sectionScheduleData[d][s].value = null
                sectionScheduleData[d][s].room_id = null
                sectionScheduleData[d][s].type = null
              }
              modified = true
            }
          }
        }
      }

      if (modified) {
        console.log(`[Sync] Updating Section ${sectionId} schedule due to Teacher ${tId} change`)
        const jsonContent = JSON.stringify(sectionScheduleData)
        if (secSchedRecord) {
          db.prepare('UPDATE section_schedules SET scheduleData = ?, updated_at = CURRENT_TIMESTAMP WHERE id_section = ? AND term = ?')
            .run(jsonContent, sectionId, term)
        } else {
          db.prepare('INSERT INTO section_schedules (scheduleData, id_section, term) VALUES (?, ?, ?)')
            .run(jsonContent, sectionId, term)
        }
      }
    }
  } catch (error) {
    console.error('Error in syncTeacherToSections:', error)
  }
}

/**
 * Synchronize section's schedule changes to affected teachers.
 */
export function syncSectionToTeachers(sectionId, term, newSectionSchedule, previousSectionSchedule = null) {
  try {
    const sId = Number(sectionId)
    console.log(`[Sync] Section ${sId} -> Teachers for term ${term}`)

    // 1. Derive affected teachers directly from the current section schedule, and
    //    also include teachers from the previous schedule so removals get cleaned up.
    const affectedTeacherIds = new Set()
    const addTeachersFromSchedule = (schedule) => {
      if (!Array.isArray(schedule)) return
      for (let d = 0; d < 7; d++) {
        for (let s = 0; s < 13; s++) {
          const sectionSlot = schedule?.[d]?.[s] || {}
          const slotTeacherIds = getInternalTeacherIdsFromSlot(sectionSlot, sectionSlot?.value)
          for (const teacherRef of slotTeacherIds) {
            const teacherNum = Number(teacherRef)
            if (Number.isFinite(teacherNum)) {
              affectedTeacherIds.add(teacherNum)
            }
          }
        }
      }
    }
    addTeachersFromSchedule(newSectionSchedule)
    addTeachersFromSchedule(previousSectionSchedule)

    // 2. Update each affected teacher
    for (const teacherId of affectedTeacherIds) {
      const teacherSchedRecord = db.prepare('SELECT id_schedule, scheduleData FROM schedules WHERE id_teacher = ? AND term = ?').get(teacherId, term)

      let teacherScheduleData
      if (teacherSchedRecord) {
        teacherScheduleData = JSON.parse(teacherSchedRecord.scheduleData)
      } else {
        teacherScheduleData = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null, type: null, schedule_kind: 'lesson', section_ids: [], teacher_ids: [] })))
      }

      let modified = false
      for (let d = 0; d < 7; d++) {
        for (let s = 0; s < 13; s++) {
          const sectionSlot = newSectionSchedule[d][s] || {}
          const sectionVal = normalizeId(sectionSlot.value)
          const teacherVal = normalizeId(teacherScheduleData[d][s]?.value)
          const slotTeacherIds = getInternalTeacherIdsFromSlot(sectionSlot, sectionVal)
          const isInternshipSlot = sectionSlot?.schedule_kind === 'internship'
          const teacherSections = Array.isArray(teacherScheduleData[d][s].section_ids) ? teacherScheduleData[d][s].section_ids : []
          const hasCurrentSection = teacherSections.includes(Number(sectionId))

          // Case A: This slot in Section's schedule has a subject taught by THIS teacher.
          // The section timetable is authoritative, so we overwrite the teacher slot
          // whenever this teacher is selected in the section slot.
          if (sectionVal && slotTeacherIds.includes(Number(teacherId))) {
            const sectionRoom = sectionSlot?.room_id || null
            const sectionType = sectionSlot?.type || null
            const sectionScheduleKind = sectionSlot?.schedule_kind || 'lesson'

            if (isInternshipSlot) {
              if (teacherScheduleData[d][s].value !== null) {
                teacherScheduleData[d][s].value = null
                teacherScheduleData[d][s].room_id = null
                teacherScheduleData[d][s].type = null
                teacherScheduleData[d][s].schedule_kind = 'internship'
                teacherScheduleData[d][s].section_ids = []
                teacherScheduleData[d][s].teacher_ids = []
                modified = true
              }
              continue
            }

            let nextTeacherSections = [...teacherSections]
            if (!nextTeacherSections.includes(Number(sectionId))) {
              nextTeacherSections = [...nextTeacherSections, Number(sectionId)]
            }
            const teacherIds = [...new Set(slotTeacherIds.map(id => Number(id)).filter(Number.isFinite))]

            if (
              teacherVal !== sectionVal
              || teacherScheduleData[d][s].room_id !== sectionRoom
              || teacherScheduleData[d][s].type !== sectionType
              || teacherScheduleData[d][s].schedule_kind !== sectionScheduleKind
              || JSON.stringify(teacherScheduleData[d][s].section_ids || []) !== JSON.stringify(nextTeacherSections)
              || JSON.stringify(teacherScheduleData[d][s].teacher_ids || []) !== JSON.stringify(teacherIds)
            ) {
              teacherScheduleData[d][s].value = sectionVal
              teacherScheduleData[d][s].room_id = sectionRoom
              teacherScheduleData[d][s].type = sectionType
              teacherScheduleData[d][s].schedule_kind = sectionScheduleKind
              teacherScheduleData[d][s].section_ids = nextTeacherSections
              teacherScheduleData[d][s].teacher_ids = teacherIds
              modified = true
            }
          }
          // Case B: This slot is no longer present in the section timetable.
          // Remove this section from the teacher slot if it was previously synced.
          else if (hasCurrentSection) {
            const nextSections = teacherSections.filter(id => Number(id) !== Number(sectionId))
            if (JSON.stringify(nextSections) !== JSON.stringify(teacherSections)) {
              teacherScheduleData[d][s].section_ids = nextSections
              if (nextSections.length === 0) {
                teacherScheduleData[d][s].value = null
                teacherScheduleData[d][s].room_id = null
                teacherScheduleData[d][s].type = null
                teacherScheduleData[d][s].schedule_kind = 'lesson'
                teacherScheduleData[d][s].teacher_ids = []
              }
              modified = true
            }
          }
        }
      }

      if (modified) {
        console.log(`[Sync] Updating Teacher ${teacherId} schedule due to Section ${sId} change`)
        const jsonContent = JSON.stringify(teacherScheduleData)
        if (teacherSchedRecord) {
          db.prepare('UPDATE schedules SET scheduleData = ? WHERE id_teacher = ? AND term = ?')
            .run(jsonContent, teacherId, term)
        } else {
          db.prepare('INSERT INTO schedules (scheduleData, id_teacher, term) VALUES (?, ?, ?)')
            .run(jsonContent, teacherId, term)
        }
      }
    }
  } catch (error) {
    console.error('Error in syncSectionToTeachers:', error)
  }
}
