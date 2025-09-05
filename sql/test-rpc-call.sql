-- Test the exact RPC call that the application is making
-- This simulates what Supabase client does when calling .rpc()

-- Test with exact parameters from your app
SELECT * FROM public.get_facilities_within_radius(
    39.01840527402992,  -- center_lat
    -94.63570913935384, -- center_lng
    40233.6             -- radius_meters (25 miles * 1609.34)
);

-- Also test if there's a schema issue
SELECT * FROM get_facilities_within_radius(
    39.01840527402992,  -- center_lat
    -94.63570913935384, -- center_lng
    40233.6             -- radius_meters
);

-- Check if the function exists in the right schema
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_facilities_within_radius';