import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const id = event.context.params.id

  // PUT - แก้ไขห้องเรียน
  if (event.node.req.method === 'PUT') {
    const body = await readBody(event)

    try {
      const stmt = db.prepare(`
        UPDATE rooms 
        SET room_name = COALESCE(?, room_name),
            building = COALESCE(?, building),
            capacity = COALESCE(?, capacity),
            description = COALESCE(?, description)
        WHERE id_room = ?
      `)

      const result = stmt.run(
        body.room_name || null,
        body.building !== undefined ? body.building : null,
        body.capacity !== undefined ? body.capacity : null,
        body.description !== undefined ? body.description : null,
        id
      )

      if (result.changes === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Room not found'
        })
      }

      return { success: true, changes: result.changes }
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Room name already exists'
        })
      }
      throw error
    }
  }

  // DELETE - ลบห้องเรียน
  if (event.node.req.method === 'DELETE') {
    const stmt = db.prepare('DELETE FROM rooms WHERE id_room = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Room not found'
      })
    }

    return { success: true, deleted: result.changes > 0 }
  }
})
