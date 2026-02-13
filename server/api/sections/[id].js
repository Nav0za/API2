import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  // PUT - แก้ไขกลุ่มเรียน
  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)

    try {
      const stmt = db.prepare(`
        UPDATE sections 
        SET section_name = COALESCE(?, section_name),
            description = COALESCE(?, description)
        WHERE id_section = ?
      `)

      const result = stmt.run(
        body.section_name || null,
        body.description !== undefined ? body.description : null,
        id
      )

      if (result.changes === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Section not found'
        })
      }

      return { success: true, changes: result.changes }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Section name already exists in this term'
        })
      }
      throw error
    }
  }

  // DELETE - ลบกลุ่มเรียน
  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM sections WHERE id_section = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Section not found'
      })
    }

    return { success: true, deleted: result.changes > 0 }
  }
})
