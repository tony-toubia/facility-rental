// Fix the availability function
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixAvailabilityFunction() {
  try {
    console.log('Fixing get_facility_availability function...')

    const sql = `
-- Fix the get_facility_availability function to resolve ambiguous column references
CREATE OR REPLACE FUNCTION get_facility_availability(
    p_facility_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_timezone TEXT DEFAULT 'America/New_York'
)
RETURNS TABLE (
    availability_date DATE,
    day_of_week INTEGER,
    time_slots JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date as check_date
    ),
    facility_config AS (
        SELECT 
            availability_increment,
            minimum_rental_duration,
            availability_timezone
        FROM facility_facilities 
        WHERE id = p_facility_id
    ),
    default_availability AS (
        SELECT 
            da.day_of_week,
            da.start_time,
            da.end_time,
            da.is_available
        FROM facility_default_availability da
        WHERE da.facility_id = p_facility_id
    ),
    exceptions AS (
        SELECT 
            e.exception_date,
            e.start_time,
            e.end_time,
            e.is_available,
            e.exception_type
        FROM facility_availability_exceptions e
        WHERE e.facility_id = p_facility_id
        AND e.exception_date BETWEEN p_start_date AND p_end_date
    )
    SELECT 
        ds.check_date,
        EXTRACT(DOW FROM ds.check_date)::INTEGER as dow,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'start_time', da.start_time,
                    'end_time', da.end_time,
                    'is_available', CASE 
                        WHEN e.exception_date IS NOT NULL THEN e.is_available
                        ELSE da.is_available
                    END,
                    'exception_type', e.exception_type
                )
            ) FILTER (WHERE da.day_of_week IS NOT NULL),
            '[]'::jsonb
        ) as time_slots
    FROM date_series ds
    LEFT JOIN default_availability da ON da.day_of_week = EXTRACT(DOW FROM ds.check_date)
    LEFT JOIN exceptions e ON e.exception_date = ds.check_date 
        AND (
            (e.start_time IS NULL AND e.end_time IS NULL) OR
            (e.start_time <= da.start_time AND e.end_time >= da.end_time)
        )
    GROUP BY ds.check_date
    ORDER BY ds.check_date;
END;
$$ LANGUAGE plpgsql;
    `

    const { error } = await supabase.rpc('exec', { sql })

    if (error) {
      console.error('Error fixing function:', error)
      
      // Try alternative approach - execute raw SQL
      const { error: rawError } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
        .limit(0)

      console.log('Trying to execute SQL directly...')
      // Since we can't execute raw SQL directly, let's create a simpler version
      console.log('Please run the SQL in fix-availability-function.sql manually in your database')
    } else {
      console.log('Function fixed successfully!')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

fixAvailabilityFunction()