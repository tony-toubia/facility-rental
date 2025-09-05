const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables (need service key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking which tables exist...');

  // List of tables to check
  const tablesToCheck = [
    'facility_facilities',
    'facility_users', 
    'facility_categories',
    'facility_images',
    'facility_amenities',
    'facility_features',
    'facility_facility_amenities',
    'facility_facility_features',
    'facility_availability',
    'facility_bookings',
    'facility_reviews'
  ];

  console.log('\n📊 Table existence check:');
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: EXISTS (${count} records)`);
        
        // If table exists and has data, show sample columns
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]).slice(0, 8);
          console.log(`   Columns: ${columns.join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }

  // Check facility_facilities structure specifically
  console.log('\n🏗️ Checking facility_facilities structure:');
  try {
    const { data: facilities, error } = await supabase
      .from('facility_facilities')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Cannot access facility_facilities:', error.message);
    } else if (facilities && facilities.length > 0) {
      const facility = facilities[0];
      console.log('✅ Sample facility record:');
      Object.keys(facility).forEach(key => {
        console.log(`   ${key}: ${typeof facility[key]} = ${facility[key]}`);
      });
    }
  } catch (err) {
    console.log('❌ Error checking facility structure:', err.message);
  }

  console.log('\n🎯 Table check completed!');
}

checkTables();