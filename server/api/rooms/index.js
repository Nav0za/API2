import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  // GET - ดึงข้อมูลห้องเรียนทั้งหมด
  if (event.node.req.method === 'GET') {
    const stmt = db.prepare('SELECT * FROM rooms ORDER BY room_name')
    const rooms = stmt.all()
    return rooms
  }

  // POST - เพิ่มห้องเรียนใหม่
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)

    // Validate
    if (!body.room_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'room_name is required'
      })
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO rooms (room_name, building, capacity, description)
        VALUES (?, ?, ?, ?)
      `)

      const result = stmt.run(
        body.room_name,
        body.building || null,
        body.capacity || null,
        body.description || null
      )

      return {
        id_room: result.lastInsertRowid,
        room_name: body.room_name,
        building: body.building || null,
        capacity: body.capacity || null,
        description: body.description || null,
        created_at: new Date().toISOString()
      }
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
})
