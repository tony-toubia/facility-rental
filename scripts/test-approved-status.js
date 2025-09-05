const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApprovedStatus() {
  console.log('🎯 Testing approved status after database update...');

  // Test the exact query the browse page uses
  console.log('\n📊 Testing browse page query:');
  try {
    const { data: facilities, error, count } = await supabase
      .from('facility_facilities')
      .select(`
        *,
        facility_users:owner_id (
          first_name,
          last_name,
          email
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
      `, { count: 'exact' })
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.log('❌ FAIL:', error.message);
    } else {
      console.log(`✅ SUCCESS: ${count} approved facilities found!`);
      
      if (facilities && facilities.length > 0) {
        console.log('\n📋 Sample facilities:');
        facilities.forEach((f, i) => {
          const ownerName = f.facility_users ? 
            `${f.facility_users.first_name} ${f.facility_users.last_name}` : 
            'No owner';
          console.log(`  ${i + 1}. ${f.name} - ${f.city}, ${f.state}`);
          console.log(`     Owner: ${ownerName}`);
          console.log(`     Price: $${f.price}/${f.price_unit}`);
          console.log(`     Status: ${f.status}, Active: ${f.is_active}`);
          console.log(`     Images: ${f.facility_images?.length || 0}`);
          console.log(`     Amenities: ${f.facility_amenities?.length || 0}`);
          console.log('');
        });
      }
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
  }

  // Verify status distribution
  console.log('\n📈 Status distribution after update:');
  try {
    const { data: statusData, error: statusError } = await supabase
      .from('facility_facilities')
      .select('status, is_active')
      .limit(100);

    if (statusError) {
      console.log('❌ Error checking status:', statusError.message);
    } else {
      const statusCounts = {};
      const activeCounts = {};
      
      statusData.forEach(f => {
        statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
        activeCounts[f.is_active] = (activeCounts[f.is_active] || 0) + 1;
      });
      
      console.log('Status values:', statusCounts);
      console.log('is_active values:', activeCounts);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  console.log('\n🎉 Test completed!');
  console.log('If you see "SUCCESS: X approved facilities found", your browse page should work!');
}

testApprovedStatus();