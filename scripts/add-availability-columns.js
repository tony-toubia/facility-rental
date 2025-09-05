const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumns() {
  try {
    console.log('🔧 Checking facility_reviews table structure...');
    
    // Test if we can access the table at all
    const { data: testData, error: testError } = await supabase
      .from('facility_reviews')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('❌ Cannot access facility_reviews table:', testError);
      return;
    }
    
    console.log('✅ Table is accessible');
    
    if (testData && testData.length > 0) {
      const columns = Object.keys(testData[0]);
      console.log('📊 Current columns:', columns);
      
      if (columns.includes('availability_status') && columns.includes('availability_comments')) {
        console.log('✅ Availability columns already exist!');
        return;
      }
    }
    
    console.log('⚠️  Availability columns are missing');
    console.log('');
    console.log('📋 SQL to run in Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE public.facility_reviews');
    console.log("ADD COLUMN IF NOT EXISTS availability_status review_status DEFAULT 'pending',");
    console.log("ADD COLUMN IF NOT EXISTS availability_comments TEXT DEFAULT '';");
    console.log('');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
    console.log('📝 Copy and paste the SQL above, then click "Run"');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

addColumns();