// Quick test to check facility location data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_actual_supabase_url_here'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_actual_supabase_anon_key_here'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFacilityLocations() {
  console.log('Testing facility location data...')
  
  const { data, error } = await supabase
    .from('facility_facilities')
    .select('id, name, city, state, latitude, longitude')
    .limit(10)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Facilities found:', data?.length)
  data?.forEach(facility => {
    console.log(`${facility.name}: ${facility.city}, ${facility.state} (${facility.latitude}, ${facility.longitude})`)
  })
}

testFacilityLocations()