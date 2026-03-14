import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const { id } = event.context.params
    const body = await readBody(event)

    // Validate input
    if (!body.name_subject || body.name_subject.trim() === '') {
        throw createError({
            statusCode: 400,
            statusMessage: 'name_subject is required'
        })
    }

    // 1. Update Subject name
    const stmt = db.prepare('UPDATE Subjects SET name_subject = ? WHERE id_subject = ?')
    stmt.run(body.name_subject, id)

    // Update Sections if provided
    if (body.id_sections && Array.isArray(body.id_sections)) {
        // 1. Delete old associations
        db.prepare('DELETE FROM SubjectSections WHERE id_subject = ?').run(id)

        // 2. Insert new associations
        const insertSection = db.prepare('INSERT INTO SubjectSections (id_subject, id_section) VALUES (?, ?)')
        const transaction = db.transaction((sections) => {
            for (const sectionId of sections) {
                insertSection.run(id, sectionId)
            }
        })
        transaction(body.id_sections)
    }

    return { success: true }
})