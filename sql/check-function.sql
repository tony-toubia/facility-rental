-- Check if the function exists and its signature
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_facilities_within_radius';

-- Check function permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'get_facilities_within_radius'
AND routine_schema = 'public';