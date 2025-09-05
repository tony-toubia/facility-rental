-- Check current facility status after migration
SELECT 
    id,
    name,
    status,
    is_active,
    city,
    state,
    created_at
FROM public.facility_facilities
ORDER BY created_at DESC;