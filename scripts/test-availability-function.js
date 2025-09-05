// Test the get_facility_availability function
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAvailabilityFunction() {
  try {
    console.log('Testing get_facility_availability function...')

    // Get a sample facility
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facility_facilities')
      .select('id, name, type')
      .limit(1)

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError)
      return
    }

    if (facilities.length === 0) {
      console.log('No facilities found')
      return
    }

    const facility = facilities[0]
    console.log(`Testing with facility: ${facility.name} (${facility.type})`)

    // Test the direct query approach (same as in component)
    const today = new Date().toISOString().split('T')[0]
    const todayObj = new Date(today)
    const dayOfWeek = todayObj.getDay()

    console.log(`Checking availability for ${today} (day of week: ${dayOfWeek})`)

    // Query default availability for this day of week
    const { data: defaultAvailability, error: defaultError } = await supabase
      .from('facility_default_availability')
      .select('*')
      .eq('facility_id', facility.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true)

    if (defaultError) {
      console.error('Error loading default availability:', defaultError)
      return
    }

    console.log('Default availability:', JSON.stringify(defaultAvailability, null, 2))

    // Check for exceptions on this specific date
    const { data: exceptions, error: exceptionsError } = await supabase
      .from('facility_availability_exceptions')
      .select('*')
      .eq('facility_id', facility.id)
      .eq('exception_date', today)

    if (exceptionsError) {
      console.error('Error loading availability exceptions:', exceptionsError)
    } else {
      console.log('Exceptions:', JSON.stringify(exceptions, null, 2))
    }

    // Summary
    console.log(`\nSummary: Found ${defaultAvailability.length} availability slots for ${facility.name} on ${today}`)

  } catch (error) {
    console.error('Error testing availability function:', error)
  }
}

testAvailabilityFunction()