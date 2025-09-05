const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This bypasses RLS

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create clients with different keys
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function checkRLS() {
  console.log('🔍 Checking RLS policies and permissions...');

  // 1. Test with anonymous client (affected by RLS)
  console.log('\n📊 Testing with anonymous client (RLS applies)...');
  
  const tables = ['facility_users', 'facility_facilities', 'facility_categories'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabaseAnon
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.log(`❌ ${table} (anon): ${error.message}`);
      } else {
        console.log(`✅ ${table} (anon): ${count} records visible`);
      }
    } catch (err) {
      console.log(`❌ ${table} (anon): ${err.message}`);
    }
  }

  // 2. Test with service role key (bypasses RLS)
  if (supabaseService) {
    console.log('\n🔑 Testing with service role key (bypasses RLS)...');
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabaseService
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          console.log(`❌ ${table} (service): ${error.message}`);
        } else {
          console.log(`✅ ${table} (service): ${count} records found`);
          if (count > 0 && data && data.length > 0) {
            console.log(`   Sample record:`, Object.keys(data[0]).slice(0, 5).join(', '));
          }
        }
      } catch (err) {
        console.log(`❌ ${table} (service): ${err.message}`);
      }
    }
  } else {
    console.log('\n⚠️ No service role key found - cannot bypass RLS');
    console.log('Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file to test without RLS');
  }

  // 3. Check RLS status on tables
  console.log('\n🔐 Checking RLS status on tables...');
  
  if (supabaseService) {
    try {
      const { data: rlsStatus, error: rlsError } = await supabaseService
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')
        .like('tablename', 'facility_%');

      if (rlsError) {
        console.log('❌ Could not check RLS status:', rlsError.message);
      } else {
        console.log('✅ Found facility tables:', rlsStatus?.map(t => t.tablename));
      }
    } catch (err) {
      console.log('❌ RLS check failed:', err.message);
    }
  }

  // 4. Try to authenticate with a test user
  console.log('\n👤 Testing authentication...');
  
  try {
    // Try to sign up a test user (this might fail if user already exists)
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      console.log('❌ Sign up error:', signUpError.message);
    } else {
      console.log('✅ Sign up successful or user already exists');
    }

    // Try to sign in
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Sign in error:', signInError.message);
    } else {
      console.log('✅ Sign in successful:', signInData.user?.email);
      
      // Now test data access with authenticated user
      console.log('\n🔓 Testing data access with authenticated user...');
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabaseAnon
            .from(table)
            .select('*', { count: 'exact' })
            .limit(1);

          if (error) {
            console.log(`❌ ${table} (authenticated): ${error.message}`);
          } else {
            console.log(`✅ ${table} (authenticated): ${count} records visible`);
          }
        } catch (err) {
          console.log(`❌ ${table} (authenticated): ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.log('❌ Authentication test failed:', err.message);
  }

  console.log('\n🎯 RLS check completed!');
  console.log('\n💡 Recommendations:');
  console.log('1. If service role shows data but anon doesn\'t, it\'s an RLS issue');
  console.log('2. Check your RLS policies in Supabase dashboard');
  console.log('3. Make sure policies allow access for your use case');
  console.log('4. Consider temporarily disabling RLS for testing');
}

checkRLS();