const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicAccess() {
  console.log('🔍 Testing public access after RLS policy updates...');

  // Test 1: Check facility_facilities access
  console.log('\n📊 Testing facility_facilities access...');
  try {
    const { data: facilities, error: facilitiesError, count } = await supabase
      .from('facility_facilities')
      .select('*', { count: 'exact' })
      .limit(5);

    if (facilitiesError) {
      console.log('❌ Facilities error:', facilitiesError.message);
    } else {
      console.log(`✅ Facilities accessible: ${count} records found`);
      if (facilities && facilities.length > 0) {
        console.log('   Sample facility:', {
          name: facilities[0].name,
          city: facilities[0].city,
          status: facilities[0].status,
          is_active: facilities[0].is_active
        });
      }
    }
  } catch (err) {
    console.log('❌ Facilities test failed:', err.message);
  }

  // Test 2: Check facility_categories access
  console.log('\n📊 Testing facility_categories access...');
  try {
    const { data: categories, error: categoriesError, count } = await supabase
      .from('facility_categories')
      .select('*', { count: 'exact' })
      .limit(5);

    if (categoriesError) {
      console.log('❌ Categories error:', categoriesError.message);
    } else {
      console.log(`✅ Categories accessible: ${count} records found`);
    }
  } catch (err) {
    console.log('❌ Categories test failed:', err.message);
  }

  // Test 3: Check facility_images access
  console.log('\n📊 Testing facility_images access...');
  try {
    const { data: images, error: imagesError, count } = await supabase
      .from('facility_images')
      .select('*', { count: 'exact' })
      .limit(5);

    if (imagesError) {
      console.log('❌ Images error:', imagesError.message);
    } else {
      console.log(`✅ Images accessible: ${count} records found`);
    }
  } catch (err) {
    console.log('❌ Images test failed:', err.message);
  }

  // Test 4: Check PostGIS function
  console.log('\n🗺️ Testing PostGIS function...');
  try {
    const { data: nearbyFacilities, error: postgisError } = await supabase
      .rpc('get_facilities_within_radius', {
        user_lat: 40.7128,
        user_lng: -74.0060,
        radius_meters: 50000
      });

    if (postgisError) {
      console.log('❌ PostGIS error:', postgisError.message);
    } else {
      console.log(`✅ PostGIS function working: ${nearbyFacilities?.length || 0} facilities found`);
      if (nearbyFacilities && nearbyFacilities.length > 0) {
        console.log('   Sample result:', {
          name: nearbyFacilities[0].name,
          distance: Math.round(nearbyFacilities[0].distance),
          city: nearbyFacilities[0].city
        });
      }
    }
  } catch (err) {
    console.log('❌ PostGIS test failed:', err.message);
  }

  // Test 5: Test complex query with joins (like the browse page uses)
  console.log('\n🔗 Testing complex query with joins...');
  try {
    const { data: complexData, error: complexError } = await supabase
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
        facility_facility_amenities (
          facility_amenities (
            name,
            icon_name
          )
        ),
        facility_facility_features (
          facility_features (
            name,
            icon_name
          )
        )
      `)
      .eq('status', 'active')
      .eq('is_active', true)
      .limit(3);

    if (complexError) {
      console.log('❌ Complex query error:', complexError.message);
    } else {
      console.log(`✅ Complex query working: ${complexData?.length || 0} facilities with full data`);
      if (complexData && complexData.length > 0) {
        const sample = complexData[0];
        console.log('   Sample complex result:', {
          name: sample.name,
          owner: sample.facility_users?.first_name,
          category: sample.facility_categories?.name,
          images: sample.facility_images?.length || 0,
          amenities: sample.facility_facility_amenities?.length || 0,
          features: sample.facility_facility_features?.length || 0
        });
      }
    }
  } catch (err) {
    console.log('❌ Complex query test failed:', err.message);
  }

  console.log('\n🎯 Public access test completed!');
  console.log('\n💡 Next steps:');
  console.log('1. If tests pass, your browse page should now work without authentication');
  console.log('2. If tests fail, you may need to run the RLS policy updates in Supabase');
  console.log('3. Check the Supabase dashboard for any policy conflicts');
}

testPublicAccess();