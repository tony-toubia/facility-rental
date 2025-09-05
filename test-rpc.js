// Test RPC call directly
import { supabase } from './lib/supabase.js'

async function testRPC() {
  console.log('Testing RPC call...')
  
  const { data, error } = await supabase
    .rpc('get_facilities_within_radius', {
      center_lat: 39.01840527402992,
      center_lng: -94.63570913935384,
      radius_meters: 40233.6
    })

  console.log('RPC Result:', { data, error })
  console.log('Data length:', data?.length)
  
  if (data && data.length > 0) {
    console.log('First facility:', data[0])
  }
}

testRPC().catch(console.error)