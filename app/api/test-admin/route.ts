import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { action, lat, lng, radius } = await request.json()
    
    if (action === 'test-connection') {
      console.log('Testing admin connection...')
      
      const { data, error } = await supabaseAdmin
        .from('facility_facilities')
        .select('id, name, status, latitude, longitude')
        .eq('status', 'active')
        .limit(3)
      
      if (error) {
        console.error('Admin connection error:', error)
        return NextResponse.json({ success: false, error: error.message })
      }
      
      console.log('Admin connection successful:', data)
      return NextResponse.json({ success: true, data, message: 'Admin connection works!' })
    }
    
    if (action === 'test-postgis') {
      console.log('Testing PostGIS with admin client...')
      
      const { data, error } = await supabaseAdmin
        .rpc('get_facilities_within_radius', {
          center_lat: lat,
          center_lng: lng,
          radius_miles: radius
        })
      
      if (error) {
        console.error('Admin PostGIS error:', error)
        return NextResponse.json({ success: false, error: error.message })
      }
      
      console.log('Admin PostGIS successful:', data?.length, 'facilities found')
      return NextResponse.json({ 
        success: true, 
        data, 
        message: `PostGIS function works! Found ${data?.length || 0} facilities.` 
      })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' })
    
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    })
  }
}