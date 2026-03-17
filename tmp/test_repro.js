import { findAvailableSlotsForMultipleClasses } from '../server/utils/autoSchedule.js'

async function runTest() {
  try {
    const teacherId = 2
    const missedDate = '2026-03-02'
    const term = '2/67'
    const selectedClasses = [
      {
        subjectId: 10,
        sectionId: 10,
        roomId: null, // Simulate missing room
        duration: 2,
        subjectName: 'คณิตศาสตร์พื้นฐาน'
      }
    ]

    // Simulate the exact API call structure
    const slots = await findAvailableSlotsForMultipleClasses(
      teacherId,
      missedDate,
      term,
      selectedClasses
    )
    console.log('Success:', JSON.stringify(slots, null, 2))
  } catch (error) {
    console.error('SERVER ERROR REPRODUCED:')
    console.error(error.stack)
  }
}

runTest()
