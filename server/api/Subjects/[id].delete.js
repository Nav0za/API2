import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  const subjectId = Number(id)

  // 1. Get subject details before deletion to know which teacher/sections are affected
  const subject = db.prepare('SELECT id_teacher FROM Subjects WHERE id_subject = ?').get(subjectId)

  // Also get all sections linked to this subject via SubjectSections join table
  const linkedSections = db.prepare('SELECT id_section FROM SubjectSections WHERE id_subject = ?').all(subjectId)

  // 2. Delete the subject (cascades to SubjectSections via FK)
  const stmt = db.prepare('DELETE FROM Subjects WHERE id_subject = ?')
  const result = stmt.run(subjectId)

  if (result.changes > 0 && subject) {
    // 3. Clean up Teacher Schedules
    const teacherSchedules = db.prepare('SELECT id_schedule, scheduleData FROM schedules WHERE id_teacher = ?').all(subject.id_teacher)

    for (const sched of teacherSchedules) {
      let data = JSON.parse(sched.scheduleData)
      let modified = false

      for (let d = 0; d < 7; d++) {
        for (let s = 0; s < 13; s++) {
          if (data[d][s].value === subjectId) {
            data[d][s].value = null
            modified = true
          }
        }
      }

      if (modified) {
        db.prepare('UPDATE schedules SET scheduleData = ? WHERE id_schedule = ?')
          .run(JSON.stringify(data), sched.id_schedule)
      }
    }

    // 4. Clean up Section Schedules for all linked sections
    for (const { id_section } of linkedSections) {
      const sectionSchedules = db.prepare('SELECT id_section_schedule, scheduleData FROM section_schedules WHERE id_section = ?').all(id_section)

      for (const sched of sectionSchedules) {
        let data = JSON.parse(sched.scheduleData)
        let modified = false

        for (let d = 0; d < 7; d++) {
          for (let s = 0; s < 13; s++) {
            if (data[d][s].value === subjectId) {
              data[d][s].value = null
              modified = true
            }
          }
        }

        if (modified) {
          db.prepare('UPDATE section_schedules SET scheduleData = ? WHERE id_section_schedule = ?')
            .run(JSON.stringify(data), sched.id_section_schedule)
        }
      }
    }
  }

  return { deleted: result.changes > 0 }
})
