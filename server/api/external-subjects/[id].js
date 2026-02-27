import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
    const method = event.node.req.method
    const id = Number(event.context.params.id)

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'id is required' })
    }

    const existing = db.prepare('SELECT * FROM external_subjects WHERE id_ext_subject = ?').get(id)
    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'External subject not found' })
    }

    // PUT - แก้ไขชื่อวิชาหรืออาจารย์
    if (method === 'PUT') {
        const body = await readBody(event)
        const { name_subject, instructor_name } = body

        if (!name_subject?.trim()) {
            throw createError({ statusCode: 400, statusMessage: 'name_subject is required' })
        }

        db.prepare(`
      UPDATE external_subjects
      SET name_subject = ?, instructor_name = ?
      WHERE id_ext_subject = ?
    `).run(name_subject.trim(), instructor_name?.trim() || null, id)

        return { success: true, id_ext_subject: id, name_subject: name_subject.trim(), instructor_name: instructor_name?.trim() || null }
    }

    // DELETE - ลบวิชานอกสาขา
    if (method === 'DELETE') {
        db.prepare('DELETE FROM external_subjects WHERE id_ext_subject = ?').run(id)
        return { success: true, deleted: id }
    }
})
