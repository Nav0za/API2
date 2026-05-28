import db from '../../utils/db.js'
import { isTeacherScheduleHiddenSubject } from '../../utils/teacherScheduleVisibility.js'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const { id_teacher, term } = query

  let stmt
  let subjects
  let baseQuery = `
    SELECT s.*,
    t.prefix, t.first_name, t.last_name,
    cs.name_subject as curriculum_name_subject,
    cs.subject_code,
    (
      SELECT GROUP_CONCAT(sec.section_name, ', ')
      FROM SubjectSections ss
      JOIN sections sec ON ss.id_section = sec.id_section
      WHERE ss.id_subject = s.id_subject
    ) as section_names,
    (
      /* Updated to return cleaner JSON without escaping issues */
      SELECT '[' || GROUP_CONCAT('{"id_section":' || sec.id_section || ',"section_name":"' || sec.section_name || '"}') || ']'
      FROM SubjectSections ss
      JOIN sections sec ON ss.id_section = sec.id_section
      WHERE ss.id_subject = s.id_subject
    ) as sections_json
    FROM Subjects s
    LEFT JOIN teachers t ON s.id_teacher = t.id_teacher
    LEFT JOIN curriculum_subjects cs ON s.curriculum_subject_id = cs.id_subject_curr
  `

  let whereClauses = []
  let params = []

  if (id_teacher) {
    whereClauses.push('s.id_teacher = ?')
    params.push(id_teacher)
  }
  if (term) {
    whereClauses.push('s.term = ?')
    params.push(term)
  }

  const finalQuery = whereClauses.length > 0
    ? `${baseQuery} WHERE ${whereClauses.join(' AND ')}`
    : baseQuery

  stmt = db.prepare(finalQuery)
  subjects = stmt.all(...params)

  // Parse JSON sections for each subject and resolve dynamic name
  return subjects.map(s => {
    let resolvedName = 'Unknown'
    if (s.curriculum_name_subject) {
      // Strictly use its name (prepended with code if available)
      resolvedName = s.subject_code ? `${s.subject_code} ${s.curriculum_name_subject}` : s.curriculum_name_subject
    }
    
    return {
      ...s,
      name_subject: resolvedName,
      sections: s.sections_json ? JSON.parse(s.sections_json) : []
    }
  }).filter(s => !id_teacher || !isTeacherScheduleHiddenSubject(s.id_subject))
})
