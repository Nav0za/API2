import db from '../../utils/db.js'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const { id_teacher } = query

  let stmt
  let subjects
  // เช็คว่ามี id teacher มั้ย
  let baseQuery = `
    SELECT s.*, r.room_name,
    (
      SELECT GROUP_CONCAT(sec.section_name, ', ')
      FROM SubjectSections ss
      JOIN sections sec ON ss.id_section = sec.id_section
      WHERE ss.id_subject = s.id_subject
    ) as section_names,
    (
      SELECT '[' || GROUP_CONCAT('{"id_section":' || sec.id_section || ',"section_name":"' || sec.section_name || '"}') || ']'
      FROM SubjectSections ss
      JOIN sections sec ON ss.id_section = sec.id_section
      WHERE ss.id_subject = s.id_subject
    ) as sections_json
    FROM Subjects s
    LEFT JOIN rooms r ON s.id_room = r.id_room
  `

  if (id_teacher) {
    stmt = db.prepare(`${baseQuery} WHERE s.id_teacher = ?`)
    subjects = stmt.all(id_teacher)
  } else {
    stmt = db.prepare(baseQuery)
    subjects = stmt.all()
  }

  // Parse JSON sections for each subject
  return subjects.map(s => ({
    ...s,
    sections: s.sections_json ? JSON.parse(s.sections_json) : []
  }))
})
