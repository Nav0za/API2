import { getHolidayOnDate, checkRoomAvailability } from '../server/utils/availability.js'
import db from '../server/utils/db.js'

async function runTests() {
  console.log('--- Starting Backend Verification ---')

  // 1. Holiday Test
  console.log('\nTesting Holiday Check:')
  // Try to find if any holiday exists on 2026-03-12 (could be 'Test Holiday' from subagent)
  let holiday = getHolidayOnDate('2026-03-12')
  if (!holiday) {
    db.prepare('INSERT INTO calendar_events (title, start, end, event_type) VALUES (\'Verification Holiday\', \'2026-03-12T00:00:00\', \'2026-03-12T23:59:59\', \'holiday\')').run()
    holiday = getHolidayOnDate('2026-03-12')
  }

  console.log('Holiday on 2026-03-12:', holiday ? holiday.title : 'None')
  if (holiday && (holiday.title === 'Verification Holiday' || holiday.title === 'Test Holiday')) {
    console.log('✅ Holiday Detection Success')
  } else {
    console.log('❌ Holiday Detection Failed')
  }

  // 2. Room Availability Test (Regular Schedule)
  console.log('\nTesting Room Availability (Regular Schedule):')
  // Slot 0 (08:00 - 09:00) is occupied for teacher 1 (test) in Room 4 (301) for term 1/2569
  const result = checkRoomAvailability({
    room_id: '4', // Room 4 is 301
    date: '2026-03-09', // A Monday
    start_time: '08:00',
    end_time: '09:00',
    term: '1/2569'
  })
  console.log('Check Room 4 on 2026-03-09 08:00-09:00:', result)
  if (!result.available) {
    console.log('✅ Regular Schedule Conflict Detected Success')
  } else {
    console.log('❌ Regular Schedule Conflict Detection Failed')
  }

  // 3. Room Availability Test (Makeup Class overlap)
  console.log('\nTesting Room Availability (Makeup Overlap):')
  // Insert a makeup class
  db.prepare(`
        INSERT INTO makeup_classes (makeup_date, makeup_time_start, makeup_time_end, room_id, status, teacher_id, original_date, original_time_slot)
        VALUES ('2026-03-15', '10:00', '12:00', 4, 'confirmed', 1, '2026-03-01', '08:00')
    `).run()

  const makeupResult = checkRoomAvailability({
    room_id: '4',
    date: '2026-03-15',
    start_time: '11:00',
    end_time: '13:00',
    term: '1/2569'
  })
  console.log('Check Room 4 on 2026-03-15 11:00-13:00 (overlaps makeup):', makeupResult)
  if (!makeupResult.available && makeupResult.reason.includes('มีสอนชดเชย')) {
    console.log('✅ Makeup Overlap Conflict Detected Success')
  } else {
    console.log('❌ Makeup Overlap Conflict Detection Failed')
  }

  // Clean up
  db.prepare('DELETE FROM calendar_events WHERE title = \'Verification Holiday\'').run()
  db.prepare('DELETE FROM makeup_classes WHERE makeup_date = \'2026-03-15\' AND room_id = 4').run()

  console.log('\n--- Verification Finished ---')
}

runTests().catch(console.error)
