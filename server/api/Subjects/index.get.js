import db from '../../utils/db.js'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const { id_teacher, term } = query

  let stmt
  let subjects
  let baseQuery = `
    SELECT s.*,
    t.prefix, t.first_name, t.last_name,
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

  // Parse JSON sections for each subject
  return subjects.map(s => ({
    ...s,
    sections: s.sections_json ? JSON.parse(s.sections_json) : []
  }))
})
