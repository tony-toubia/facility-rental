const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing service key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugRelationships() {
  console.log('🔍 Debugging foreign key relationships...');

  // Get a sample facility
  const { data: facility } = await supabase
    .from('facility_facilities')
    .select('*')
    .limit(1)
    .single();

  if (!facility) {
    console.log('❌ No facility found');
    return;
  }

  console.log('\n📊 Sample facility:');
  console.log('  ID:', facility.id);
  console.log('  Name:', facility.name);
  console.log('  Owner ID:', facility.owner_id);
  console.log('  Category ID:', facility.category_id);

  // Check if owner exists
  console.log('\n👤 Checking owner relationship:');
  const { data: owner, error: ownerError } = await supabase
    .from('facility_users')
    .select('*')
    .eq('id', facility.owner_id)
    .maybeSingle();

  if (ownerError) {
    console.log('❌ Owner error:', ownerError.message);
  } else if (owner) {
    console.log('✅ Owner found:', owner.first_name, owner.last_name);
  } else {
    console.log('⚠️ No owner found with ID:', facility.owner_id);
  }

  // Check if category exists
  console.log('\n📂 Checking category relationship:');
  if (facility.category_id) {
    const { data: category, error: categoryError } = await supabase
      .from('facility_categories')
      .select('*')
      .eq('id', facility.category_id)
      .maybeSingle();

    if (categoryError) {
      console.log('❌ Category error:', categoryError.message);
    } else if (category) {
      console.log('✅ Category found:', category.name);
    } else {
      console.log('⚠️ No category found with ID:', facility.category_id);
    }
  } else {
    console.log('⚠️ Facility has no category_id');
  }

  // Test the join query with service key
  console.log('\n🔗 Testing join query with service key:');
  const { data: joinData, error: joinError } = await supabase
    .from('facility_facilities')
    .select(`
      name,
      facility_users:owner_id (
        first_name,
        last_name
      ),
      facility_categories:category_id (
        name
      )
    `)
    .eq('id', facility.id)
    .single();

  if (joinError) {
    console.log('❌ Join error:', joinError.message);
  } else {
    console.log('✅ Join result:', {
      name: joinData.name,
      owner: joinData.facility_users,
      category: joinData.facility_categories
    });
  }

  console.log('\n🎯 Relationship debug completed!');
}

debugRelationships();