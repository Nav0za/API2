import db from '../../utils/db.js'
import { clearTeacherScheduleVisibilityCache } from '../../utils/teacherScheduleVisibility.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // curriculum_subject_id is now strictly required as the sole name source
    if (!body.curriculum_subject_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'curriculum_subject_id is required'
      })
    }
    if (!body.id_sections || body.id_sections.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'sections are required'
      })
    }

    // Resolve name for the response payload to keep frontend happy
    let resolvedName = 'Unknown'
    const cs = db.prepare('SELECT subject_code, name_subject FROM curriculum_subjects WHERE id_subject_curr = ?').get(body.curriculum_subject_id)
    if (cs) {
      resolvedName = cs.subject_code ? `${cs.subject_code} ${cs.name_subject}` : cs.name_subject
    }
    const inferredHideInTeacherSchedule = body.hide_in_teacher_schedule !== undefined
      ? (body.hide_in_teacher_schedule ? 1 : 0)
      : (/ฝึกงาน/.test(cs?.name_subject || '') ? 1 : 0)

    // 1. Check if Subject for this teacher/external + term + curriculum_subj already exists
    let subjectId
    let queryCond = 'term = ? AND curriculum_subject_id = ?'
    let queryParams = [body.term, body.curriculum_subject_id]
    
    if (body.id_teacher) {
       queryCond += ' AND id_teacher = ?'
       queryParams.push(body.id_teacher)
    } else if (body.external_teacher_name) {
       queryCond += ' AND external_teacher_name = ?'
       queryParams.push(body.external_teacher_name)
    } else {
       queryCond += ' AND id_teacher IS NULL AND external_teacher_name IS NULL'
    }

    const existing = db.prepare(`SELECT id_subject FROM Subjects WHERE ${queryCond}`).get(...queryParams)
    
    if (existing) {
       subjectId = existing.id_subject
       // update id_plan_subject just in case
       if (body.id_plan_subject) {
         db.prepare('UPDATE Subjects SET id_plan_subject = ? WHERE id_subject = ?').run(body.id_plan_subject, subjectId)
       }
    } else {
       // Insert Subject
        const stmt = db.prepare('INSERT INTO Subjects (id_teacher, term, curriculum_subject_id, id_plan_subject, external_teacher_name, hide_in_teacher_schedule) VALUES (?, ?, ?, ?, ?, ?)')
        const result = stmt.run(body.id_teacher || null, body.term || null, body.curriculum_subject_id, body.id_plan_subject || null, body.external_teacher_name || null, inferredHideInTeacherSchedule)
        subjectId = result.lastInsertRowid
        clearTeacherScheduleVisibilityCache(subjectId)
    }

    // 2. Insert SubjectSections (Join table)
    const insertSection = db.prepare('INSERT OR IGNORE INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
    const transaction = db.transaction((sections) => {
      for (const sectionId of sections) {
        insertSection.run(subjectId, sectionId)
      }
    })
    transaction(body.id_sections)

    return {
      id_subject: subjectId,
      name_subject: resolvedName,
      id_sections: body.id_sections,
      status: 1
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Subject constraint error'
      })
    }
    throw error
  }
})
