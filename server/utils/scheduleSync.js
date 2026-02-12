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

        // 1. Get all subjects taught by this teacher
        const teacherSubjects = db.prepare('SELECT id_subject, id_section FROM Subjects WHERE id_teacher = ?').all(tId)
        const teacherSubjectIds = new Set(teacherSubjects.map(s => normalizeId(s.id_subject)))

        // We need to find ALL sections that MIGHT have had this teacher's classes.
        // The most reliable way is to find all sections this teacher teaches.
        const affectedSectionIds = new Set(teacherSubjects.map(s => s.id_section).filter(id => id != null))

        // Subject to Section mapping
        const subjectToSection = {}
        teacherSubjects.forEach(s => {
            subjectToSection[normalizeId(s.id_subject)] = s.id_section
        })

        // 2. Update each affected section
        for (const sectionId of affectedSectionIds) {
            const secSchedRecord = db.prepare('SELECT id_section_schedule, scheduleData FROM section_schedules WHERE id_section = ? AND term = ?').get(sectionId, term)

            let sectionScheduleData
            if (secSchedRecord) {
                sectionScheduleData = JSON.parse(secSchedRecord.scheduleData)
            } else {
                sectionScheduleData = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null })))
            }

            let modified = false
            for (let d = 0; d < 7; d++) {
                for (let s = 0; s < 13; s++) {
                    const teacherVal = normalizeId(newTeacherSchedule[d][s]?.value)
                    const sectionVal = normalizeId(sectionScheduleData[d][s]?.value)

                    // Case A: This slot in Teacher's schedule has a subject for THIS section
                    if (teacherVal && teacherSubjectIds.has(teacherVal) && subjectToSection[teacherVal] === sectionId) {
                        if (sectionVal !== teacherVal) {
                            sectionScheduleData[d][s].value = teacherVal
                            modified = true
                        }
                    }
                    // Case B: This slot in Section's schedule CURRENTLY contains one of this teacher's subjects,
                    // but the Teacher's schedule doesn't have it here anymore (or has something else).
                    else if (sectionVal && teacherSubjectIds.has(sectionVal)) {
                        // If we are here, Case A failed, meaning teacher schedule doesn't have THIS subject here.
                        sectionScheduleData[d][s].value = null
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

        // 1. Get all subjects in this section and their teachers
        const sectionSubjects = db.prepare('SELECT id_subject, id_teacher FROM Subjects WHERE id_section = ?').all(sId)
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
                teacherScheduleData = Array.from({ length: 7 }, () => Array.from({ length: 13 }, () => ({ value: null })))
            }

            let modified = false
            for (let d = 0; d < 7; d++) {
                for (let s = 0; s < 13; s++) {
                    const sectionVal = normalizeId(newSectionSchedule[d][s]?.value)
                    const teacherVal = normalizeId(teacherScheduleData[d][s]?.value)

                    // Case A: This slot in Section's schedule has a subject taught by THIS teacher
                    if (sectionVal && sectionSubjectIds.has(sectionVal) && subjectToTeacher[sectionVal] === teacherId) {
                        if (teacherVal !== sectionVal) {
                            teacherScheduleData[d][s].value = sectionVal
                            modified = true
                        }
                    }
                    // Case B: This slot in Teacher's schedule CURRENTLY contains a subject from this section,
                    // but the Section's schedule doesn't have it here anymore.
                    else if (teacherVal && sectionSubjectIds.has(teacherVal)) {
                        // Check if this subject actually belongs to this teacher (redundant check but safe)
                        if (subjectToTeacher[teacherVal] === teacherId) {
                            teacherScheduleData[d][s].value = null
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
