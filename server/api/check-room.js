import { checkRoomAvailability } from '../utils/availability.js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { room_id, date, start_time, end_time, term, current_makeup_id } = query

    // Validate parameters
    if (!date || !start_time || !end_time || !term) {
        throw createError({
            statusCode: 400,
            statusMessage: 'date, start_time, end_time, and term are required'
        })
    }

    try {
        const excludeIds = current_makeup_id
            ? String(current_makeup_id).split(',').map(id => id.trim()).filter(Boolean)
            : []

        return checkRoomAvailability({
            room_id,
            date,
            start_time,
            end_time,
            term,
            exclude_makeup_ids: excludeIds
        })

    } catch (error) {
        console.error('Error checking room availability:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to check room availability'
        })
    }
})
