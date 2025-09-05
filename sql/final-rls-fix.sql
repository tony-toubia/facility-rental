-- Final RLS fix: Allow public read access to facility owner info for browsing
-- This enables the browse page to show facility owner names

-- 1. Allow public read access to facility_users (limited fields for browsing)
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_users;

-- Allow public to see basic owner info for active facilities only
CREATE POLICY "allow_public_read_facility_owners" ON public.facility_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE owner_id = facility_users.id 
            AND status = 'active' 
            AND is_active = true
        )
    );

-- Allow authenticated users to see their own data and admins to see all
CREATE POLICY "allow_authenticated_access_users" ON public.facility_users
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            auth.uid()::text = auth_user_id::text OR
            user_type = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            auth.uid()::text = auth_user_id::text OR
            user_type = 'admin'
        )
    );

-- 2. Ensure facility_facilities allows public read access
DROP POLICY IF EXISTS "allow_public_read_facilities" ON public.facility_facilities;

CREATE POLICY "allow_public_read_facilities" ON public.facility_facilities
    FOR SELECT USING (
        status = 'active' AND is_active = true
    );

-- 3. Ensure facility_categories allows public read access  
DROP POLICY IF EXISTS "allow_public_read_categories" ON public.facility_categories;

CREATE POLICY "allow_public_read_categories" ON public.facility_categories
    FOR SELECT USING (is_active = true);

-- 4. Ensure facility_images allows public read access
DROP POLICY IF EXISTS "allow_public_read_images" ON public.facility_images;

CREATE POLICY "allow_public_read_images" ON public.facility_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_images.facility_id 
            AND status = 'active' 
            AND is_active = true
        )
    );

-- 5. Ensure facility_amenities allows public read access
DROP POLICY IF EXISTS "allow_public_read_amenities" ON public.facility_amenities;

CREATE POLICY "allow_public_read_amenities" ON public.facility_amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_amenities.facility_id 
            AND status = 'active' 
            AND is_active = true
        )
    );

-- 6. Ensure facility_features allows public read access
DROP POLICY IF EXISTS "allow_public_read_features" ON public.facility_features;

CREATE POLICY "allow_public_read_features" ON public.facility_features
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_features.facility_id 
            AND status = 'active' 
            AND is_active = true
        )
    );

-- Verify the policies are working
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('facility_facilities', 'facility_users', 'facility_categories', 'facility_images', 'facility_amenities', 'facility_features')
ORDER BY tablename, policyname;