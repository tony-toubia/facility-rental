-- Fix the UUID type mismatch - auth_user_id is UUID, not TEXT
-- This corrects the type casting in our helper function and policies

-- Drop and recreate the helper function with correct types
DROP FUNCTION IF EXISTS get_current_facility_user_id();

CREATE OR REPLACE FUNCTION get_current_facility_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.facility_users 
        WHERE auth_user_id = auth.uid()  -- No ::text casting needed since both are UUID
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies and recreate with correct types
DROP POLICY IF EXISTS "Authenticated users can create facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can view approved facilities or their own" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can update their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can delete their own facilities" ON public.facility_facilities;

-- Create policies with correct UUID handling
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

-- Fix availability policies
DROP POLICY IF EXISTS "Users can manage availability for their facilities" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Public can read availability for approved facilities" ON public.facility_default_availability;

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

-- Fix other availability tables
DROP POLICY IF EXISTS "Users can manage availability exceptions for their facilities" ON public.facility_availability_exceptions;

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

DROP POLICY IF EXISTS "Users can manage holiday selections for their facilities" ON public.facility_selected_holidays;

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