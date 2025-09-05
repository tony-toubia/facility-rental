const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCorrectSchema() {
  console.log('🔍 Testing public access with correct schema...');

  // Test 1: Check facility_facilities access
  console.log('\n📊 Testing facility_facilities access...');
  try {
    const { data: facilities, error: facilitiesError, count } = await supabase
      .from('facility_facilities')
      .select('*', { count: 'exact' })
      .limit(3);

    if (facilitiesError) {
      console.log('❌ Facilities error:', facilitiesError.message);
    } else {
      console.log(`✅ Facilities accessible: ${count} records found`);
      if (facilities && facilities.length > 0) {
        console.log('   Sample facility:', {
          name: facilities[0].name,
          city: facilities[0].city,
          status: facilities[0].status,
          is_active: facilities[0].is_active,
          latitude: facilities[0].latitude,
          longitude: facilities[0].longitude
        });
      }
    }
  } catch (err) {
    console.log('❌ Facilities test failed:', err.message);
  }

  // Test 2: Check facility_amenities access (direct relationship)
  console.log('\n📊 Testing facility_amenities access...');
  try {
    const { data: amenities, error: amenitiesError, count } = await supabase
      .from('facility_amenities')
      .select('*', { count: 'exact' })
      .limit(3);

    if (amenitiesError) {
      console.log('❌ Amenities error:', amenitiesError.message);
    } else {
      console.log(`✅ Amenities accessible: ${count} records found`);
      if (amenities && amenities.length > 0) {
        console.log('   Sample amenity:', {
          name: amenities[0].name,
          facility_id: amenities[0].facility_id,
          icon_name: amenities[0].icon_name
        });
      }
    }
  } catch (err) {
    console.log('❌ Amenities test failed:', err.message);
  }

  // Test 3: Check facility_features access (direct relationship)
  console.log('\n📊 Testing facility_features access...');
  try {
    const { data: features, error: featuresError, count } = await supabase
      .from('facility_features')
      .select('*', { count: 'exact' })
      .limit(3);

    if (featuresError) {
      console.log('❌ Features error:', featuresError.message);
    } else {
      console.log(`✅ Features accessible: ${count} records found`);
      if (features && features.length > 0) {
        console.log('   Sample feature:', {
          name: features[0].name,
          facility_id: features[0].facility_id
        });
      }
    }
  } catch (err) {
    console.log('❌ Features test failed:', err.message);
  }

  // Test 4: Check PostGIS function
  console.log('\n🗺️ Testing PostGIS function...');
  try {
    // Use Kansas City coordinates (where your sample data is located)
    const { data: nearbyFacilities, error: postgisError } = await supabase
      .rpc('get_facilities_within_radius', {
        user_lat: 39.0997,  // Kansas City latitude
        user_lng: -94.5786, // Kansas City longitude
        radius_meters: 100000 // 100km radius
      });

    if (postgisError) {
      console.log('❌ PostGIS error:', postgisError.message);
    } else {
      console.log(`✅ PostGIS function working: ${nearbyFacilities?.length || 0} facilities found`);
      if (nearbyFacilities && nearbyFacilities.length > 0) {
        console.log('   Sample result:', {
          name: nearbyFacilities[0].name,
          distance: Math.round(nearbyFacilities[0].distance),
          city: nearbyFacilities[0].city,
          state: nearbyFacilities[0].state
        });
      }
    }
  } catch (err) {
    console.log('❌ PostGIS test failed:', err.message);
  }

  // Test 5: Test complex query with correct relationships
  console.log('\n🔗 Testing complex query with correct schema...');
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
          amenities: sample.facility_amenities?.length || 0,
          features: sample.facility_features?.length || 0
        });
      }
    }
  } catch (err) {
    console.log('❌ Complex query test failed:', err.message);
  }

  console.log('\n🎯 Schema test completed!');
  console.log('\n💡 Next steps:');
  console.log('1. If tests pass, your browse page should work');
  console.log('2. If tests fail, run the corrected RLS policies in Supabase');
  console.log('3. The PostGIS function should work with Kansas City area data');
}

testCorrectSchema();