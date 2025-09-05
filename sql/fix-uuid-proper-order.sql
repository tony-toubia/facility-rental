-- Fix UUID type mismatch by dropping policies first, then function, then recreating properly
-- This handles the dependency order correctly

-- Step 1: Drop all policies that depend on the function
DROP POLICY IF EXISTS "Users can view approved facilities or their own" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can update their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can delete their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Users can manage availability for their facilities" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Users can manage availability exceptions for their facilities" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Users can manage holiday selections for their facilities" ON public.facility_selected_holidays;
DROP POLICY IF EXISTS "Users can manage amenities for their facilities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Users can manage features for their facilities" ON public.facility_features;

-- Step 2: Now we can drop the function
DROP FUNCTION IF EXISTS get_current_facility_user_id();

-- Step 3: Create the corrected function (without ::text casting)
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

-- Step 4: Recreate all the policies with the corrected function
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

-- Step 5: Make sure we still have the INSERT policy and public read policies
CREATE POLICY "Authenticated users can create facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public can read availability for approved facilities" ON public.facility_default_availability
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

CREATE POLICY "Public can read amenities for approved facilities" ON public.facility_amenities
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

CREATE POLICY "Public can read features for approved facilities" ON public.facility_features
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );