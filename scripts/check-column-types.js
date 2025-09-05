const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing service key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumnTypes() {
  console.log('🔍 Checking actual column types in facility_facilities...');

  // Get a sample record to see actual data types
  const { data: sample, error } = await supabase
    .from('facility_facilities')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error getting sample:', error.message);
    return;
  }

  console.log('\n📊 Sample facility record with data types:');
  Object.entries(sample).forEach(([key, value]) => {
    const type = typeof value;
    const jsType = value === null ? 'null' : 
                   Array.isArray(value) ? 'array' :
                   type === 'object' ? 'object' :
                   type;
    console.log(`  ${key}: ${jsType} = ${value}`);
  });

  // Check specific problematic columns
  console.log('\n🎯 Key columns for PostGIS function:');
  const keyColumns = ['latitude', 'longitude', 'price', 'rating', 'review_count'];
  keyColumns.forEach(col => {
    const value = sample[col];
    const type = typeof value;
    console.log(`  ${col}: ${type} = ${value} (${value === null ? 'NULL' : 'has value'})`);
  });

  console.log('\n🔧 Recommended function return types:');
  console.log('  latitude: NUMERIC (not DOUBLE PRECISION)');
  console.log('  longitude: NUMERIC (not DOUBLE PRECISION)');
  console.log('  price: NUMERIC (not NUMERIC)');
  console.log('  rating: NUMERIC (not NUMERIC)');
  console.log('  review_count: INTEGER (correct)');
}

checkColumnTypes();