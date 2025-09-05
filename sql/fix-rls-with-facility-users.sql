-- Fix RLS policies to work with facility_users foreign key constraint
-- owner_id references facility_users.id, not auth.uid() directly

-- Drop all existing policies for facility_facilities
DROP POLICY IF EXISTS "Authenticated users can create facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Everyone can view approved active facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can view their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can update their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can delete their own facilities" ON public.facility_facilities;

-- Create new policies that work with facility_users table
CREATE POLICY "Authenticated users can create facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    );

CREATE POLICY "Everyone can view approved active facilities" ON public.facility_facilities
    FOR SELECT USING (status = 'approved' AND is_active = true);

CREATE POLICY "Facility owners can view their own facilities" ON public.facility_facilities
    FOR SELECT USING (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    );

CREATE POLICY "Facility owners can update their own facilities" ON public.facility_facilities
    FOR UPDATE USING (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    )
    WITH CHECK (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    );

CREATE POLICY "Facility owners can delete their own facilities" ON public.facility_facilities
    FOR DELETE USING (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    );

-- Fix availability table policies
DROP POLICY IF EXISTS "Facility owners can manage their availability" ON public.facility_default_availability;

CREATE POLICY "Facility owners can manage their availability" ON public.facility_default_availability
    FOR ALL USING (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    );

-- Fix availability exceptions policy
DROP POLICY IF EXISTS "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions;

CREATE POLICY "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions
    FOR ALL USING (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    );

-- Fix holiday selections policy
DROP POLICY IF EXISTS "Facility owners can manage their holiday selections" ON public.facility_selected_holidays;

CREATE POLICY "Facility owners can manage their holiday selections" ON public.facility_selected_holidays
    FOR ALL USING (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    );

-- Fix amenities and features policies
DROP POLICY IF EXISTS "Facility owners can manage their amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Public can read amenities for approved facilities" ON public.facility_amenities;

CREATE POLICY "Facility owners can manage their amenities" ON public.facility_amenities
    FOR ALL USING (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Public can read amenities for approved facilities" ON public.facility_amenities
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

DROP POLICY IF EXISTS "Facility owners can manage their features" ON public.facility_features;
DROP POLICY IF EXISTS "Public can read features for approved facilities" ON public.facility_features;

CREATE POLICY "Facility owners can manage their features" ON public.facility_features
    FOR ALL USING (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT f.id FROM public.facility_facilities f
            JOIN public.facility_users u ON f.owner_id = u.id
            WHERE u.auth_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Public can read features for approved facilities" ON public.facility_features
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );