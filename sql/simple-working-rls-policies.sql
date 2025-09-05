-- Simple working RLS policies that avoid complex type casting issues
-- This approach uses functions to handle the type conversions properly

-- First, let's create a helper function to get the current user's facility_user ID
CREATE OR REPLACE FUNCTION get_current_facility_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.facility_users 
        WHERE auth_user_id = auth.uid()::text
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the debug policies
DROP POLICY IF EXISTS "Allow all authenticated users to do everything" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow all authenticated users to manage availability" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Allow all authenticated users to manage availability exceptions" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Allow all authenticated users to manage holiday selections" ON public.facility_selected_holidays;

-- Create simple policies for facility_facilities
CREATE POLICY "Authenticated users can create facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view approved facilities or their own" ON public.facility_facilities
    FOR SELECT USING (
        (status = 'approved' AND is_active = true) OR
        (owner_id = get_current_facility_user_id())
    );

CREATE POLICY "Users can update their own facilities" ON public.facility_facilities
    FOR UPDATE USING (owner_id = get_current_facility_user_id())
    WITH CHECK (owner_id = get_current_facility_user_id());

CREATE POLICY "Users can delete their own facilities" ON public.facility_facilities
    FOR DELETE USING (owner_id = get_current_facility_user_id());

-- Create policies for availability tables using the helper function
CREATE POLICY "Users can manage availability for their facilities" ON public.facility_default_availability
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

CREATE POLICY "Public can read availability for approved facilities" ON public.facility_default_availability
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

-- For facility_availability_exceptions
CREATE POLICY "Users can manage availability exceptions for their facilities" ON public.facility_availability_exceptions
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

-- For facility_selected_holidays
CREATE POLICY "Users can manage holiday selections for their facilities" ON public.facility_selected_holidays
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

-- For facility_amenities
DROP POLICY IF EXISTS "Allow all operations on amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Facility owners can manage their amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Public can read amenities for approved facilities" ON public.facility_amenities;

CREATE POLICY "Users can manage amenities for their facilities" ON public.facility_amenities
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

CREATE POLICY "Public can read amenities for approved facilities" ON public.facility_amenities
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

-- For facility_features
DROP POLICY IF EXISTS "Allow all operations on features" ON public.facility_features;
DROP POLICY IF EXISTS "Facility owners can manage their features" ON public.facility_features;
DROP POLICY IF EXISTS "Public can read features for approved facilities" ON public.facility_features;

CREATE POLICY "Users can manage features for their facilities" ON public.facility_features
    FOR ALL USING (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

CREATE POLICY "Public can read features for approved facilities" ON public.facility_features
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );