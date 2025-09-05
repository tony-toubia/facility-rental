const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatusValues() {
  console.log('🔍 Checking actual status values in facility_facilities...');

  // Get all unique status values
  const { data: facilities, error } = await supabase
    .from('facility_facilities')
    .select('status, is_active')
    .limit(50);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log('\n📊 Status values found:');
  const statusCounts = {};
  const isActiveCounts = {};

  facilities.forEach(f => {
    statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
    isActiveCounts[f.is_active] = (isActiveCounts[f.is_active] || 0) + 1;
  });

  console.log('Status values:', statusCounts);
  console.log('is_active values:', isActiveCounts);

  // Test different filter combinations
  console.log('\n🧪 Testing different filter combinations:');

  // Test 1: status = 'active'
  const { data: activeData, error: activeError } = await supabase
    .from('facility_facilities')
    .select('id, name, status, is_active', { count: 'exact' })
    .eq('status', 'active')
    .limit(5);

  if (activeError) {
    console.log('❌ status = "active":', activeError.message);
  } else {
    console.log(`✅ status = "active": ${activeData.length} facilities`);
  }

  // Test 2: status = 'approved'
  const { data: approvedData, error: approvedError } = await supabase
    .from('facility_facilities')
    .select('id, name, status, is_active', { count: 'exact' })
    .eq('status', 'approved')
    .limit(5);

  if (approvedError) {
    console.log('❌ status = "approved":', approvedError.message);
  } else {
    console.log(`✅ status = "approved": ${approvedData.length} facilities`);
  }

  // Test 3: is_active = true
  const { data: isActiveData, error: isActiveError } = await supabase
    .from('facility_facilities')
    .select('id, name, status, is_active', { count: 'exact' })
    .eq('is_active', true)
    .limit(5);

  if (isActiveError) {
    console.log('❌ is_active = true:', isActiveError.message);
  } else {
    console.log(`✅ is_active = true: ${isActiveData.length} facilities`);
  }

  // Test 4: Both conditions
  const { data: bothData, error: bothError } = await supabase
    .from('facility_facilities')
    .select('id, name, status, is_active', { count: 'exact' })
    .eq('status', 'active')
    .eq('is_active', true)
    .limit(5);

  if (bothError) {
    console.log('❌ status = "active" AND is_active = true:', bothError.message);
  } else {
    console.log(`✅ status = "active" AND is_active = true: ${bothData.length} facilities`);
  }

  // Test 5: No filters (all facilities)
  const { data: allData, error: allError } = await supabase
    .from('facility_facilities')
    .select('id, name, status, is_active', { count: 'exact' })
    .limit(5);

  if (allError) {
    console.log('❌ No filters:', allError.message);
  } else {
    console.log(`✅ No filters: ${allData.length} facilities`);
  }

  console.log('\n🎯 Recommendation:');
  if (bothData && bothData.length > 0) {
    console.log('✅ Use: .eq("status", "active").eq("is_active", true)');
  } else if (activeData && activeData.length > 0) {
    console.log('✅ Use: .eq("status", "active")');
  } else if (isActiveData && isActiveData.length > 0) {
    console.log('✅ Use: .eq("is_active", true)');
  } else {
    console.log('✅ Use: No filters (show all facilities)');
  }
}

checkStatusValues();