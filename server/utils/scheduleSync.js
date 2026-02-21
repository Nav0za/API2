import db from './db.js'

/**
 * Normalizes subject IDs to numbers to avoid type mismatch in Set.has()
 */
function normalizeId(id) {
    if (id === null || id === undefined) return null
    const num = Number(id)
    return isNaN(num) ? id : num
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
        teacherSubjects.forEach(s => {
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
                sectionScheduleData = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null })))
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
                        if (sectionVal !== teacherVal || sectionScheduleData[d][s].room_id !== teacherRoom) {
                            sectionScheduleData[d][s].value = teacherVal
                            sectionScheduleData[d][s].room_id = teacherRoom
                            modified = true
                        }
                    }
                    // Case B: This slot in Section's schedule CURRENTLY contains one of this teacher's subjects,
                    // but the Teacher's schedule doesn't have it here anymore (or has something else).
                    else if (sectionVal && teacherSubjectIds.has(sectionVal)) {
                        // If we are here, Case A failed, meaning teacher schedule doesn't have THIS subject here for THIS section.
                        sectionScheduleData[d][s].value = null
                        sectionScheduleData[d][s].room_id = null
                        modified = true
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
export function syncSectionToTeachers(sectionId, term, newSectionSchedule) {
    try {
        const sId = Number(sectionId)
        console.log(`[Sync] Section ${sId} -> Teachers for term ${term}`)

        // 1. Get all subjects associated with this section and their teachers
        const sectionSubjects = db.prepare(`
            SELECT s.id_subject, s.id_teacher
            FROM Subjects s
            JOIN SubjectSections ss ON s.id_subject = ss.id_subject
            WHERE ss.id_section = ?
        `).all(sId)

        const sectionSubjectIds = new Set(sectionSubjects.map(s => normalizeId(s.id_subject)))
        const affectedTeacherIds = new Set(sectionSubjects.map(s => s.id_teacher).filter(id => id != null))

        // Subject to Teacher mapping
        const subjectToTeacher = {}
        sectionSubjects.forEach(s => {
            subjectToTeacher[normalizeId(s.id_subject)] = s.id_teacher
        })

        // 2. Update each affected teacher
        for (const teacherId of affectedTeacherIds) {
            const teacherSchedRecord = db.prepare('SELECT id_schedule, scheduleData FROM schedules WHERE id_teacher = ? AND term = ?').get(teacherId, term)

            let teacherScheduleData
            if (teacherSchedRecord) {
                teacherScheduleData = JSON.parse(teacherSchedRecord.scheduleData)
            } else {
                teacherScheduleData = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null, room_id: null })))
            }

            let modified = false
            for (let d = 0; d < 7; d++) {
                for (let s = 0; s < 13; s++) {
                    const sectionVal = normalizeId(newSectionSchedule[d][s]?.value)
                    const teacherVal = normalizeId(teacherScheduleData[d][s]?.value)

                    // Case A: This slot in Section's schedule has a subject taught by THIS teacher
                    if (sectionVal && sectionSubjectIds.has(sectionVal) && subjectToTeacher[sectionVal] === teacherId) {
                        const sectionRoom = newSectionSchedule[d][s]?.room_id || null

                        // Handle section_ids in teacher schedule
                        let teacherSections = teacherScheduleData[d][s].section_ids || []
                        if (!teacherSections.includes(Number(sectionId))) {
                            teacherSections = [...teacherSections, Number(sectionId)]
                        }

                        if (teacherVal !== sectionVal || teacherScheduleData[d][s].room_id !== sectionRoom || JSON.stringify(teacherScheduleData[d][s].section_ids) !== JSON.stringify(teacherSections)) {
                            teacherScheduleData[d][s].value = sectionVal
                            teacherScheduleData[d][s].room_id = sectionRoom
                            teacherScheduleData[d][s].section_ids = teacherSections
                            modified = true
                        }
                    }
                    // Case B: This slot in Teacher's schedule CURRENTLY contains a subject that belongs to this section,
                    // but the Section's schedule doesn't have it here anymore.
                    else if (teacherVal && sectionSubjectIds.has(teacherVal)) {
                        // Check if this subject actually belongs to this teacher (redundant check but safe)
                        // When clearing from section side, remove THIS section from teacher's slot
                        let teacherSections = teacherScheduleData[d][s].section_ids || []
                        if (teacherSections.includes(Number(sectionId))) {
                            teacherSections = teacherSections.filter(id => id !== Number(sectionId))
                            teacherScheduleData[d][s].section_ids = teacherSections

                            // If no sections left, clear the whole slot for the teacher
                            if (teacherSections.length === 0) {
                                teacherScheduleData[d][s].value = null
                                teacherScheduleData[d][s].room_id = null
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
