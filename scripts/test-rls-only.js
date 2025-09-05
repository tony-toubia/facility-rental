const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSOnly() {
  console.log('🔍 Testing RLS policies only (no PostGIS)...');

  // Test 1: Basic facility access
  console.log('\n📊 Test 1: Basic facility access');
  try {
    const { data: facilities, error, count } = await supabase
      .from('facility_facilities')
      .select('id, name, city, status, is_active, price, price_unit', { count: 'exact' })
      .limit(3);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ PASS: ${count} facilities accessible`);
      if (facilities && facilities.length > 0) {
        console.log('   Sample:', {
          name: facilities[0].name,
          city: facilities[0].city,
          price: facilities[0].price,
          price_unit: facilities[0].price_unit,
          status: facilities[0].status
        });
      }
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 2: Facility with owner info
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
      .limit(2);

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

  // Test 3: Categories
  console.log('\n📂 Test 3: Categories access');
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
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 4: Images
  console.log('\n🖼️ Test 4: Images access');
  try {
    const { data: images, error, count } = await supabase
      .from('facility_images')
      .select('image_url, is_primary', { count: 'exact' })
      .limit(3);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ PASS: ${count} images accessible`);
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 5: Amenities
  console.log('\n🏊 Test 5: Amenities access');
  try {
    const { data: amenities, error, count } = await supabase
      .from('facility_amenities')
      .select('name, icon_name', { count: 'exact' })
      .limit(3);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ PASS: ${count} amenities accessible`);
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Test 6: Basic function (if it exists)
  console.log('\n🔧 Test 6: Basic function');
  try {
    const { data: functionData, error } = await supabase
      .rpc('get_all_facilities');

    if (error) {
      console.log('❌ FAIL:', error.message);
      console.log('   Note: Basic function needs to be created');
    } else {
      console.log(`✅ PASS: Basic function working (${functionData?.length || 0} facilities)`);
      if (functionData && functionData.length > 0) {
        console.log('   Sample:', {
          name: functionData[0].name,
          city: functionData[0].city,
          price_unit: functionData[0].price_unit,
          status: functionData[0].status
        });
      }
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  console.log('\n🎯 RLS test completed!');
  console.log('\n📋 Summary:');
  console.log('If tests 1-5 pass, your browse page should work with direct queries.');
  console.log('If test 6 passes, you have a working function for more complex queries.');
  console.log('PostGIS can be added later once basic functionality works.');
}

testRLSOnly();