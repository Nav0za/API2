import { getHolidayOnDate } from '../server/utils/availability.js'
import Holidays from 'date-holidays'

async function runTests() {
    console.log('--- Starting Unified Holiday Verification ---')

    // 1. Official Holiday Test (Makha Bucha 2026)
    // Makha Bucha 2026 is March 03, 2026 according to the library
    const dateStr = '2026-03-03'
    console.log(`\nTesting Official Holiday Check for ${dateStr}:`)

    const holiday = getHolidayOnDate(dateStr)
    console.log(`Holiday on ${dateStr}:`, holiday ? holiday.title : 'None')

    if (holiday && (holiday.title.includes('Makha Bucha') || holiday.title.includes('วันมาฆบูชา'))) {
        console.log('✅ Official Holiday Detection Success')
    } else {
        console.log('❌ Official Holiday Detection Failed')

        // Let's list some holidays for 2026 to see what's available
        const hd = new Holidays('TH', { languages: ['th', 'en'] })
        const hol2026 = hd.getHolidays(2026)
        console.log('\nAvailable Holidays in 2026:')
        hol2026.forEach(h => console.log(`${h.date.split(' ')[0]}: ${h.name}`))
    }

    // 2. Manual Holiday Test (from DB)
    console.log('\nTesting Manual Holiday Check:')
    const manualDate = '2026-12-25' // Christmas (sometimes manual or official, let's check)
    const holidayManual = getHolidayOnDate(manualDate)
    console.log(`Holiday on ${manualDate}:`, holidayManual ? holidayManual.title : 'None')

    console.log('\n--- Verification Finished ---')
}

runTests().catch(console.error)
