const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log('🔍 Starting database diagnostics...');

  try {
    // 1. Check facility_users table
    console.log('\n📊 Checking facility_users table...');
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('facility_users')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log(`Total users: ${usersCount}`);
    if (usersError) {
      console.error('❌ Users error:', usersError);
    } else {
      console.log('✅ Sample users:', users?.map(u => ({ 
        id: u.id, 
        auth_user_id: u.auth_user_id, 
        email: u.email, 
        user_type: u.user_type 
      })));
    }

    // 2. Check the specific auth_user_id from logs
    console.log('\n🔍 Checking specific auth_user_id from logs...');
    const authId = 'd5ceb263-2c16-4053-b5b8-b1a488856bab';
    const { data: specificUser, error: specificUserError } = await supabase
      .from('facility_users')
      .select('*')
      .eq('auth_user_id', authId)
      .maybeSingle();

    console.log(`User with auth_user_id ${authId}:`, specificUser);
    if (specificUserError) {
      console.error('❌ Specific user error:', specificUserError);
    }

    // 3. Check facility_facilities table
    console.log('\n📊 Checking facility_facilities table...');
    const { data: facilities, error: facilitiesError, count: facilitiesCount } = await supabase
      .from('facility_facilities')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log(`Total facilities: ${facilitiesCount}`);
    if (facilitiesError) {
      console.error('❌ Facilities error:', facilitiesError);
    } else {
      console.log('✅ Sample facilities:', facilities?.map(f => ({ 
        id: f.id, 
        name: f.name, 
        owner_id: f.owner_id,
        status: f.status,
        is_active: f.is_active,
        city: f.city,
        state: f.state
      })));
    }

    // 4. Check facility_categories table
    console.log('\n📊 Checking facility_categories table...');
    const { data: categories, error: categoriesError, count: categoriesCount } = await supabase
      .from('facility_categories')
      .select('*', { count: 'exact' });

    console.log(`Total categories: ${categoriesCount}`);
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
    } else {
      console.log('✅ Categories:', categories?.map(c => ({ 
        id: c.id, 
        name: c.name, 
        is_active: c.is_active 
      })));
    }

    // 5. Check facilities with location data
    console.log('\n🌍 Checking facilities with location data...');
    const { data: facilitiesWithLocation, error: locationError } = await supabase
      .from('facility_facilities')
      .select('id, name, latitude, longitude, city, state')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(10);

    console.log(`Facilities with location data: ${facilitiesWithLocation?.length || 0}`);
    if (locationError) {
      console.error('❌ Location error:', locationError);
    } else {
      console.log('✅ Sample facilities with location:', facilitiesWithLocation?.map(f => ({ 
        name: f.name, 
        lat: f.latitude, 
        lng: f.longitude,
        city: f.city,
        state: f.state
      })));
    }

    // 6. Test the PostGIS query that's failing
    console.log('\n🗺️ Testing PostGIS radius search...');
    const testLat = 40.7128;
    const testLng = -74.0060;
    const testRadius = 50000; // 50km in meters

    const { data: nearbyFacilities, error: postgisError } = await supabase
      .rpc('get_facilities_within_radius', {
        user_lat: testLat,
        user_lng: testLng,
        radius_meters: testRadius
      });

    console.log(`PostGIS query result count: ${nearbyFacilities?.length || 0}`);
    if (postgisError) {
      console.error('❌ PostGIS error:', postgisError);
    } else {
      console.log('✅ Sample nearby facilities:', nearbyFacilities?.slice(0, 3).map(f => ({ 
        name: f.name, 
        distance: f.distance,
        city: f.city,
        state: f.state
      })));
    }

    // 7. Check if the PostGIS function exists
    if (postgisError) {
      console.log('\n🔄 Trying simple facility query...');
      const { data: simpleFacilities, error: simpleError } = await supabase
        .from('facility_facilities')
        .select(`
          *,
          facility_users!facility_facilities_owner_id_fkey(first_name, last_name, email),
          facility_categories!facility_facilities_category_id_fkey(name, icon_name, color)
        `)
        .eq('status', 'active')
        .eq('is_active', true)
        .limit(5);

      console.log(`Simple query result count: ${simpleFacilities?.length || 0}`);
      if (simpleError) {
        console.error('❌ Simple query error:', simpleError);
      } else {
        console.log('✅ Simple query results:', simpleFacilities?.map(f => ({ 
          name: f.name, 
          owner: f.facility_users?.first_name + ' ' + f.facility_users?.last_name,
          category: f.facility_categories?.name
        })));
      }
    }

    // 8. Check table permissions
    console.log('\n🔐 Checking table access...');
    const tables = ['facility_users', 'facility_facilities', 'facility_categories', 'facility_images'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.error(`❌ Cannot access ${table}:`, error.message);
      } else {
        console.log(`✅ Can access ${table}`);
      }
    }

    // 9. Check current user authentication
    console.log('\n👤 Checking current user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else if (user) {
      console.log('✅ Authenticated user:', { id: user.id, email: user.email });
    } else {
      console.log('⚠️ No authenticated user');
    }

    console.log('\n🎯 Diagnostics completed!');

  } catch (error) {
    console.error('💥 Diagnostic error:', error);
  }
}

// Run the diagnostics
debugDatabase();