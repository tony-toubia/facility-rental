-- Fix RLS policies to allow public read access to facilities
-- This allows unauthenticated users to browse facilities

-- 1. Update facility_facilities table policy to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_facilities;

CREATE POLICY "allow_public_read_facilities" ON public.facility_facilities
    FOR SELECT USING (
        status = 'active' AND is_active = true
    );

CREATE POLICY "allow_authenticated_write_facilities" ON public.facility_facilities
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            auth.uid()::text = owner_id::text OR
            EXISTS (
                SELECT 1 FROM facility_users 
                WHERE auth_user_id = auth.uid() 
                AND user_type = 'admin'
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            auth.uid()::text = owner_id::text OR
            EXISTS (
                SELECT 1 FROM facility_users 
                WHERE auth_user_id = auth.uid() 
                AND user_type = 'admin'
            )
        )
    );

-- 2. Update facility_categories to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_categories;

CREATE POLICY "allow_public_read_categories" ON public.facility_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "allow_admin_write_categories" ON public.facility_categories
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_users 
            WHERE auth_user_id = auth.uid() 
            AND user_type = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_users 
            WHERE auth_user_id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- 3. Update facility_images to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_images;

CREATE POLICY "allow_public_read_images" ON public.facility_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_images.facility_id 
            AND status = 'active' 
            AND is_active = true
        )
    );

CREATE POLICY "allow_owner_write_images" ON public.facility_images
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_images.facility_id 
            AND owner_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_images.facility_id 
            AND owner_id::text = auth.uid()::text
        )
    );

-- 4. Update facility_amenities to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_amenities;

CREATE POLICY "allow_public_read_amenities" ON public.facility_amenities
    FOR SELECT USING (true);

CREATE POLICY "allow_admin_write_amenities" ON public.facility_amenities
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_users 
            WHERE auth_user_id = auth.uid() 
            AND user_type = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_users 
            WHERE auth_user_id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- 5. Update facility_features to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_features;

CREATE POLICY "allow_public_read_features" ON public.facility_features
    FOR SELECT USING (true);

CREATE POLICY "allow_admin_write_features" ON public.facility_features
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_users 
            WHERE auth_user_id = auth.uid() 
            AND user_type = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_users 
            WHERE auth_user_id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- 6. Update facility_facility_amenities to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_facility_amenities;

CREATE POLICY "allow_public_read_facility_amenities" ON public.facility_facility_amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_facility_amenities.facility_id 
            AND status = 'active' 
            AND is_active = true
        )
    );

CREATE POLICY "allow_owner_write_facility_amenities" ON public.facility_facility_amenities
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_facility_amenities.facility_id 
            AND owner_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_facility_amenities.facility_id 
            AND owner_id::text = auth.uid()::text
        )
    );

-- 7. Update facility_facility_features to allow public read access
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_facility_features;

CREATE POLICY "allow_public_read_facility_features" ON public.facility_facility_features
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_facility_features.facility_id 
            AND status = 'active' 
            AND is_active = true
        )
    );

CREATE POLICY "allow_owner_write_facility_features" ON public.facility_facility_features
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_facility_features.facility_id 
            AND owner_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE id = facility_facility_features.facility_id 
            AND owner_id::text = auth.uid()::text
        )
    );

-- 8. Keep facility_users restricted to authenticated users only
-- (No changes needed - users should remain private)

-- 9. Keep facility_availability restricted for now
-- (Booking-related data should require authentication)

-- 10. Keep facility_bookings restricted to authenticated users
-- (Booking data should remain private)

-- 11. Keep facility_reviews restricted to authenticated users
-- (Review data should remain private for admin workflow)

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'facility_%'
ORDER BY tablename, policyname;