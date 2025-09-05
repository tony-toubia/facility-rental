// Script to seed availability data for testing
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function seedAvailabilityData() {
  try {
    console.log('Starting availability data seeding...')

    // First, get all facilities
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facility_facilities')
      .select('id, name, type')

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError)
      return
    }

    console.log(`Found ${facilities.length} facilities`)

    // Update facilities with availability configuration
    for (const facility of facilities) {
      const { error: updateError } = await supabase
        .from('facility_facilities')
        .update({
          availability_increment: 60, // 1 hour slots
          minimum_rental_duration: 60, // minimum 1 hour
          availability_timezone: 'America/New_York',
          availability_notes: 'Standard business hours availability'
        })
        .eq('id', facility.id)

      if (updateError) {
        console.error(`Error updating facility ${facility.name}:`, updateError)
      } else {
        console.log(`Updated availability config for ${facility.name}`)
      }
    }

    // Add default availability (Monday-Friday 9am-5pm)
    const defaultAvailability = []
    for (const facility of facilities) {
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        defaultAvailability.push({
          facility_id: facility.id,
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
          is_available: true
        })
      }
    }

    const { error: availabilityError } = await supabase
      .from('facility_default_availability')
      .upsert(defaultAvailability, { 
        onConflict: 'facility_id,day_of_week,start_time,end_time',
        ignoreDuplicates: true 
      })

    if (availabilityError) {
      console.error('Error inserting default availability:', availabilityError)
    } else {
      console.log(`Added default availability for ${facilities.length} facilities`)
    }

    // Add weekend availability for some facility types
    const weekendFacilities = facilities.filter(f => 
      ['Conference Room', 'Event Hall', 'Sports Complex'].includes(f.type)
    )

    const weekendAvailability = []
    for (const facility of weekendFacilities) {
      // Saturday (6) and Sunday (0)
      for (const day of [0, 6]) {
        weekendAvailability.push({
          facility_id: facility.id,
          day_of_week: day,
          start_time: '10:00',
          end_time: '18:00',
          is_available: true
        })
      }
    }

    if (weekendAvailability.length > 0) {
      const { error: weekendError } = await supabase
        .from('facility_default_availability')
        .upsert(weekendAvailability, { 
          onConflict: 'facility_id,day_of_week,start_time,end_time',
          ignoreDuplicates: true 
        })

      if (weekendError) {
        console.error('Error inserting weekend availability:', weekendError)
      } else {
        console.log(`Added weekend availability for ${weekendFacilities.length} facilities`)
      }
    }

    // Add extended hours for gyms and sports facilities
    const extendedHoursFacilities = facilities.filter(f => 
      ['Gym', 'Sports Complex', 'Swimming Pool'].includes(f.type)
    )

    const extendedAvailability = []
    for (const facility of extendedHoursFacilities) {
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        extendedAvailability.push({
          facility_id: facility.id,
          day_of_week: day,
          start_time: '06:00',
          end_time: '22:00',
          is_available: true
        })
      }
    }

    if (extendedAvailability.length > 0) {
      const { error: extendedError } = await supabase
        .from('facility_default_availability')
        .upsert(extendedAvailability, { 
          onConflict: 'facility_id,day_of_week,start_time,end_time',
          ignoreDuplicates: true 
        })

      if (extendedError) {
        console.error('Error inserting extended availability:', extendedError)
      } else {
        console.log(`Added extended hours for ${extendedHoursFacilities.length} facilities`)
      }
    }

    console.log('Availability data seeding completed!')

    // Verify the data
    const { data: verifyData, error: verifyError } = await supabase
      .from('facility_facilities')
      .select(`
        name,
        type,
        availability_increment,
        minimum_rental_duration,
        facility_default_availability(count)
      `)

    if (verifyError) {
      console.error('Error verifying data:', verifyError)
    } else {
      console.log('\nVerification results:')
      verifyData.forEach(facility => {
        console.log(`${facility.name} (${facility.type}): ${facility.facility_default_availability[0]?.count || 0} availability slots`)
      })
    }

  } catch (error) {
    console.error('Error seeding availability data:', error)
  }
}

// Run the seeding
seedAvailabilityData()