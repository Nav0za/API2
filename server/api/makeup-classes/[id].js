import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  // PUT - อัปเดตคลาสชดเชย (เช่น เปลี่ยน status, เพิ่มห้อง)
  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)

    const stmt = db.prepare(`
      UPDATE makeup_classes 
      SET status = COALESCE(?, status),
          room_id = COALESCE(?, room_id),
          notes = COALESCE(?, notes),
          makeup_date = COALESCE(?, makeup_date),
          makeup_time_start = COALESCE(?, makeup_time_start),
          makeup_time_end = COALESCE(?, makeup_time_end),
          updated_at = CURRENT_TIMESTAMP
      WHERE id_makeup = ?
    `)

    const result = stmt.run(
      body.status || null,
      body.room_id !== undefined ? body.room_id : null,
      body.notes !== undefined ? body.notes : null,
      body.makeup_date || null,
      body.makeup_time_start || null,
      body.makeup_time_end || null,
      id
    )

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    return { success: true, changes: result.changes }
  }

  // DELETE - ลบคลาสชดเชย
  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM makeup_classes WHERE id_makeup = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Makeup class not found'
      })
    }

    return { success: true, deleted: result.changes > 0 }
  }
})
