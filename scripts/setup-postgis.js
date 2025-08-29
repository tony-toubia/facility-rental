const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need to add this to .env.local

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.')
  console.error('Required variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY (service role key, not anon key)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupPostGIS() {
  try {
    console.log('🚀 Setting up PostGIS for geolocation features...')
    
    // 1. Enable PostGIS extension
    console.log('📍 Enabling PostGIS extension...')
    const { error: extensionError } = await supabase.rpc('enable_postgis_extension')
    
    if (extensionError && !extensionError.message.includes('already exists')) {
      console.error('❌ Error enabling PostGIS extension:', extensionError)
      
      // Try alternative method
      console.log('🔄 Trying alternative method...')
      const { error: altError } = await supabase
        .from('pg_extension')
        .select('*')
        .eq('extname', 'postgis')
      
      if (altError) {
        console.log('ℹ️  PostGIS extension may need to be enabled manually in Supabase dashboard')
        console.log('   Go to: Database > Extensions > Search for "postgis" > Enable')
      }
    } else {
      console.log('✅ PostGIS extension enabled')
    }
    
    // 2. Read and execute SQL functions
    console.log('📝 Creating PostGIS functions...')
    const sqlPath = path.join(__dirname, '..', 'sql', 'postgis-functions.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.includes('CREATE EXTENSION')) {
        // Skip extension creation as we handled it above
        continue
      }
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error && !error.message.includes('already exists')) {
          console.warn('⚠️  Warning executing statement:', error.message)
        }
      } catch (err) {
        console.warn('⚠️  Warning with statement:', err.message)
      }
    }
    
    console.log('✅ PostGIS functions created')
    
    // 3. Test the functions
    console.log('🧪 Testing PostGIS functions...')
    
    // Test get_facilities_within_radius function
    const { data: testData, error: testError } = await supabase
      .rpc('get_facilities_within_radius', {
        center_lat: 39.0458,
        center_lng: -76.6413,
        radius_meters: 40233.6 // 25 miles
      })
    
    if (testError) {
      console.error('❌ Error testing PostGIS function:', testError)
    } else {
      console.log('✅ PostGIS functions working correctly')
      console.log(`   Found ${testData?.length || 0} facilities in test area`)
    }
    
    // 4. Check if facilities have coordinates
    console.log('📊 Checking facility coordinate data...')
    const { data: facilityStats, error: statsError } = await supabase
      .from('facility_facilities')
      .select('id, latitude, longitude, city, state')
      .eq('status', 'active')
    
    if (statsError) {
      console.error('❌ Error checking facility data:', statsError)
    } else {
      const totalFacilities = facilityStats?.length || 0
      const facilitiesWithCoords = facilityStats?.filter(f => f.latitude && f.longitude).length || 0
      
      console.log(`📈 Facility coordinate status:`)
      console.log(`   Total active facilities: ${totalFacilities}`)
      console.log(`   Facilities with coordinates: ${facilitiesWithCoords}`)
      console.log(`   Facilities needing geocoding: ${totalFacilities - facilitiesWithCoords}`)
      
      if (facilitiesWithCoords < totalFacilities) {
        console.log('💡 Tip: Use the FacilityLocationPicker component to add coordinates to existing facilities')
      }
    }
    
    console.log('\n🎉 PostGIS setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Add your Google Maps API key to .env.local')
    console.log('2. Enable these APIs in Google Cloud Console:')
    console.log('   - Maps JavaScript API')
    console.log('   - Places API') 
    console.log('   - Geocoding API')
    console.log('3. Update existing facilities with coordinates using the admin interface')
    console.log('4. Test the location search on the browse page')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Helper function to enable PostGIS (if needed)
async function enablePostGISExtension() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'CREATE EXTENSION IF NOT EXISTS postgis;'
  })
  return error
}

setupPostGIS()