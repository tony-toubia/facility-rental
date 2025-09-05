const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalTest() {
  console.log('🎯 Final comprehensive test for browse page functionality...');

  // Test 1: Basic facility access
  console.log('\n📊 Test 1: Basic facility access');
  try {
    const { data: facilities, error, count } = await supabase
      .from('facility_facilities')
      .select('id, name, city, status, is_active', { count: 'exact' })
      .limit(3);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ PASS: ${count} facilities accessible`);
      console.log('   Sample:', facilities[0]?.name, '-', facilities[0]?.city);
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 2: Facility with owner info (the critical join)
  console.log('\n👤 Test 2: Facility with owner info');
  try {
    const { data: facilitiesWithOwner, error } = await supabase
      .from('facility_facilities')
      .select(`
        name,
        city,
        facility_users:owner_id (
          first_name,
          last_name
        )
      `)
      .limit(3);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log('✅ PASS: Facility-owner joins working');
      facilitiesWithOwner.forEach(f => {
        const ownerName = f.facility_users ? 
          `${f.facility_users.first_name} ${f.facility_users.last_name}` : 
          'No owner';
        console.log(`   ${f.name} - Owner: ${ownerName}`);
      });
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 3: Full browse page query (exactly what the app uses)
  console.log('\n🔗 Test 3: Full browse page query');
  try {
    const { data: fullData, error } = await supabase
      .from('facility_facilities')
      .select(`
        *,
        facility_users:owner_id (
          first_name,
          last_name,
          email
        ),
        facility_categories:category_id (
          name,
          icon_name,
          color
        ),
        facility_images (
          image_url,
          is_primary
        ),
        facility_amenities (
          name,
          icon_name
        ),
        facility_features (
          name
        )
      `)
      .eq('status', 'active')
      .eq('is_active', true)
      .limit(2);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ PASS: Full query working (${fullData.length} facilities)`);
      if (fullData.length > 0) {
        const sample = fullData[0];
        console.log('   Sample facility:');
        console.log('     Name:', sample.name);
        console.log('     Owner:', sample.facility_users?.first_name, sample.facility_users?.last_name);
        console.log('     Category:', sample.facility_categories?.name || 'None');
        console.log('     Images:', sample.facility_images?.length || 0);
        console.log('     Amenities:', sample.facility_amenities?.length || 0);
        console.log('     Features:', sample.facility_features?.length || 0);
        console.log('     Location:', sample.city, sample.state);
        console.log('     Price:', `$${sample.price}/${sample.price_unit}`);
      }
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 4: PostGIS function (if it exists)
  console.log('\n🗺️ Test 4: PostGIS location search');
  try {
    const { data: nearbyFacilities, error } = await supabase
      .rpc('get_facilities_within_radius', {
        user_lat: 39.0997,  // Kansas City
        user_lng: -94.5786,
        radius_meters: 50000 // 50km
      });

    if (error) {
      console.log('❌ FAIL:', error.message);
      console.log('   Note: PostGIS function needs to be created in Supabase');
    } else {
      console.log(`✅ PASS: PostGIS working (${nearbyFacilities.length} facilities found)`);
      if (nearbyFacilities.length > 0) {
        console.log('   Nearest:', nearbyFacilities[0].name, 
                   `(${Math.round(nearbyFacilities[0].distance)}m away)`);
      }
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 5: Categories access
  console.log('\n📂 Test 5: Categories access');
  try {
    const { data: categories, error, count } = await supabase
      .from('facility_categories')
      .select('name, icon_name', { count: 'exact' })
      .eq('is_active', true)
      .limit(5);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ PASS: ${count} categories accessible`);
      console.log('   Sample categories:', categories.map(c => c.name).join(', '));
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  console.log('\n🎯 Final test completed!');
  console.log('\n📋 Summary:');
  console.log('If all tests pass, your browse page should work perfectly!');
  console.log('If PostGIS fails, run the PostGIS function SQL in Supabase.');
  console.log('If owner joins fail, run the final RLS fix SQL in Supabase.');
}

finalTest();