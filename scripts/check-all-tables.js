const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllTables() {
  console.log('🔍 Checking all tables in the database...');

  // List of all possible table names to check
  const possibleTables = [
    'facility_users',
    'facility_facilities', 
    'facility_categories',
    'facility_images',
    'facility_amenities',
    'facility_features',
    'facility_availability',
    'facility_bookings',
    'facility_reviews',
    'facility_facility_amenities',
    'facility_facility_features',
    'facilities', // Maybe it's just 'facilities'?
    'users',
    'categories',
    'images',
    'amenities',
    'features',
    'bookings',
    'reviews'
  ];

  for (const tableName of possibleTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: ${count} records`);
        if (count > 0 && data && data.length > 0) {
          console.log(`   Sample columns:`, Object.keys(data[0]).slice(0, 5).join(', '));
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }

  // Also check for any tables that might have 'facility' in the name
  console.log('\n🔍 Checking for any tables with facility-related data...');
  
  // Try some common variations
  const variations = [
    'public.facility_facilities',
    'public.facilities',
    'Facility',
    'Facilities',
    'FACILITY_FACILITIES',
    'FACILITIES'
  ];

  for (const variation of variations) {
    try {
      const { data, error, count } = await supabase
        .from(variation)
        .select('*', { count: 'exact' })
        .limit(1);

      if (!error && count > 0) {
        console.log(`✅ Found data in ${variation}: ${count} records`);
      }
    } catch (err) {
      // Ignore errors for variations
    }
  }

  console.log('\n🎯 Table check completed!');
}

checkAllTables();