-- Debug script to check admin access to facilities
-- Run this in your Supabase SQL editor to debug the admin page issue

-- 1. Check if there are any facilities in the database
SELECT 
  id, 
  name, 
  status, 
  owner_id,
  created_at
FROM public.facility_facilities 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check if there are facilities with pending_approval or needs_changes status
SELECT 
  id, 
  name, 
  status, 
  owner_id,
  created_at
FROM public.facility_facilities 
WHERE status IN ('pending_approval', 'needs_changes')
ORDER BY created_at DESC;

-- 3. Check the current RLS policies on facility_facilities
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'facility_facilities';

-- 4. Check if the facility_amenities and facility_features tables exist and have data
SELECT 'facility_amenities' as table_name, COUNT(*) as count FROM public.facility_amenities
UNION ALL
SELECT 'facility_features' as table_name, COUNT(*) as count FROM public.facility_features;

-- 5. Test the exact query that the admin page is using (without RLS)
-- This will help identify if it's a data issue or RLS issue
SET row_security = off; -- Temporarily disable RLS for testing

SELECT 
  ff.*,
  fu.first_name,
  fu.last_name,
  fu.email
FROM public.facility_facilities ff
LEFT JOIN public.facility_users fu ON ff.owner_id = fu.id
WHERE ff.status IN ('pending_approval', 'needs_changes')
ORDER BY ff.created_at DESC
LIMIT 5;

SET row_security = on; -- Re-enable RLS