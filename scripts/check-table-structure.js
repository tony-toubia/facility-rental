const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables (need service key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructure() {
  console.log('🔍 Checking actual table structure in database...');

  // Get all tables in the public schema
  try {
    const { data: tables, error } = await supabase
      .rpc('sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

    if (error) {
      console.error('❌ Error getting tables:', error);
      return;
    }

    console.log('\n📊 All tables in public schema:');
    const tableNames = tables.map(t => t.table_name);
    tableNames.forEach(name => {
      console.log(`  - ${name}`);
    });

    // Check specifically for facility-related tables
    console.log('\n🏢 Facility-related tables:');
    const facilityTables = tableNames.filter(name => name.includes('facility'));
    facilityTables.forEach(name => {
      console.log(`  ✅ ${name}`);
    });

    // Check for missing junction tables
    console.log('\n🔗 Checking for junction tables:');
    const expectedJunctionTables = [
      'facility_facility_amenities',
      'facility_facility_features',
      'facility_facility_categories'
    ];

    for (const tableName of expectedJunctionTables) {
      if (tableNames.includes(tableName)) {
        console.log(`  ✅ ${tableName} - EXISTS`);
      } else {
        console.log(`  ❌ ${tableName} - MISSING`);
      }
    }

    // Get structure of main facility table
    console.log('\n🏗️ Structure of facility_facilities table:');
    try {
      const { data: columns, error: colError } = await supabase
        .rpc('sql', {
          query: `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'facility_facilities'
            ORDER BY ordinal_position;
          `
        });

      if (colError) {
        console.error('❌ Error getting columns:', colError);
      } else {
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
      }
    } catch (err) {
      console.error('❌ Error checking table structure:', err.message);
    }

    // Check foreign key relationships
    console.log('\n🔗 Foreign key relationships:');
    try {
      const { data: fkeys, error: fkError } = await supabase
        .rpc('sql', {
          query: `
            SELECT 
              tc.table_name,
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = 'public'
              AND tc.table_name LIKE 'facility%'
            ORDER BY tc.table_name, kcu.column_name;
          `
        });

      if (fkError) {
        console.error('❌ Error getting foreign keys:', fkError);
      } else {
        fkeys.forEach(fk => {
          console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }
    } catch (err) {
      console.error('❌ Error checking foreign keys:', err.message);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }

  console.log('\n🎯 Table structure check completed!');
}

checkTableStructure();