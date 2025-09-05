-- Complete cleanup and fix for UUID type mismatch
-- This drops ALL existing policies first, then recreates them properly

-- Step 1: Drop ALL existing policies on facility_facilities
DROP POLICY IF EXISTS "Authenticated users can create facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can view approved facilities or their own" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can update their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can delete their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Everyone can view approved active facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can view their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can update their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can delete their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow authenticated users to insert facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow everyone to view facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow owners to update their facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facilities are publicly readable" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can manage their facilities" ON public.facility_facilities;

-- Step 2: Drop ALL existing policies on availability tables
DROP POLICY IF EXISTS "Users can manage availability for their facilities" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Public can read availability for approved facilities" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Facility owners can manage their availability" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Anyone can read availability for approved facilities" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Authenticated users can manage availability" ON public.facility_default_availability;

DROP POLICY IF EXISTS "Users can manage availability exceptions for their facilities" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Anyone can read availability exceptions for approved facilities" ON public.facility_availability_exceptions;

DROP POLICY IF EXISTS "Users can manage holiday selections for their facilities" ON public.facility_selected_holidays;
DROP POLICY IF EXISTS "Facility owners can manage their holiday selections" ON public.facility_selected_holidays;

-- Step 3: Drop ALL existing policies on amenities and features
DROP POLICY IF EXISTS "Users can manage amenities for their facilities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Public can read amenities for approved facilities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Allow all operations on amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Facility owners can manage their amenities" ON public.facility_amenities;

DROP POLICY IF EXISTS "Users can manage features for their facilities" ON public.facility_features;
DROP POLICY IF EXISTS "Public can read features for approved facilities" ON public.facility_features;
DROP POLICY IF EXISTS "Allow all operations on features" ON public.facility_features;
DROP POLICY IF EXISTS "Facility owners can manage their features" ON public.facility_features;

-- Step 4: Now drop the function
DROP FUNCTION IF EXISTS get_current_facility_user_id();

-- Step 5: Create the corrected function (without ::text casting)
CREATE OR REPLACE FUNCTION get_current_facility_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.facility_users 
        WHERE auth_user_id = auth.uid()  -- No ::text casting since both are UUID
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create clean, working policies
-- Facility policies
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

-- Availability policies
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

-- Availability exceptions policies
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

-- Holiday selections policies
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

-- Amenities policies
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

-- Features policies
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