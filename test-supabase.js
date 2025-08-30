// Simple test to check Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ahzmfkjtiiyuipweaktx.supabase.co'
const supabaseKey = 'your_actual_supabase_anon_key_here' // Replace with real key

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic query
    const { data, error } = await supabase
      .from('facility_facilities')
      .select('id, name, status')
      .limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
    } else {
      console.log('Supabase connection successful:', data)
    }
    
    // Test PostGIS function
    console.log('Testing PostGIS function...')
    const { data: postgisData, error: postgisError } = await supabase
      .rpc('get_facilities_within_radius', {
        center_lat: 39.0267,
        center_lng: -94.6275,
        radius_miles: 25
      })
    
    if (postgisError) {
      console.error('PostGIS function error:', postgisError)
    } else {
      console.log('PostGIS function successful:', postgisData?.length, 'facilities found')
    }
    
  } catch (err) {
    console.error('Connection test failed:', err)
  }
}

testConnection()