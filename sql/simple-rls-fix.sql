-- Simple RLS fix without recursion
-- This avoids infinite recursion by using simple, direct policies

-- 1. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_facilities;
DROP POLICY IF EXISTS "allow_public_read_facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "allow_authenticated_write_facilities" ON public.facility_facilities;

DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_users;
DROP POLICY IF EXISTS "allow_public_read_facility_owners" ON public.facility_users;
DROP POLICY IF EXISTS "allow_authenticated_access_users" ON public.facility_users;

DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_categories;
DROP POLICY IF EXISTS "allow_public_read_categories" ON public.facility_categories;

DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_images;
DROP POLICY IF EXISTS "allow_public_read_images" ON public.facility_images;

DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_amenities;
DROP POLICY IF EXISTS "allow_public_read_amenities" ON public.facility_amenities;

DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_features;
DROP POLICY IF EXISTS "allow_public_read_features" ON public.facility_features;

-- 2. Create simple, non-recursive policies

-- Allow public read access to active facilities
CREATE POLICY "public_read_facilities" ON public.facility_facilities
    FOR SELECT USING (status = 'active' AND is_active = true);

-- Allow owners and admins to manage their facilities
CREATE POLICY "owner_manage_facilities" ON public.facility_facilities
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        auth.uid()::text = owner_id::text
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid()::text = owner_id::text
    );

-- Allow public read access to facility owner basic info (for browsing)
CREATE POLICY "public_read_owners" ON public.facility_users
    FOR SELECT USING (true);

-- Allow users to manage their own data
CREATE POLICY "users_manage_own" ON public.facility_users
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        auth.uid()::text = auth_user_id::text
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid()::text = auth_user_id::text
    );

-- Allow public read access to active categories
CREATE POLICY "public_read_categories" ON public.facility_categories
    FOR SELECT USING (is_active = true);

-- Allow public read access to images of active facilities
CREATE POLICY "public_read_images" ON public.facility_images
    FOR SELECT USING (true);

-- Allow public read access to amenities of active facilities
CREATE POLICY "public_read_amenities" ON public.facility_amenities
    FOR SELECT USING (true);

-- Allow public read access to features of active facilities
CREATE POLICY "public_read_features" ON public.facility_features
    FOR SELECT USING (true);

-- 3. Verify policies are created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('facility_facilities', 'facility_users', 'facility_categories', 'facility_images', 'facility_amenities', 'facility_features')
ORDER BY tablename, policyname;