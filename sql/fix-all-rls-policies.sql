-- Comprehensive fix for all RLS policies
-- This fixes the mismatch between owner_id being auth.uid() vs facility_users.id

-- Drop all existing policies for facility_facilities
DROP POLICY IF EXISTS "Allow authenticated users to insert facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow everyone to view facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow owners to update their facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facilities are publicly readable" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can manage their facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can read their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can create facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can update their facility visibility" ON public.facility_facilities;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.facility_facilities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.facility_facilities;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON public.facility_facilities;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON public.facility_facilities;

-- Create new policies that work with owner_id = auth.uid()
CREATE POLICY "Authenticated users can create facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view approved active facilities" ON public.facility_facilities
    FOR SELECT USING (status = 'approved' AND is_active = true);

CREATE POLICY "Facility owners can view their own facilities" ON public.facility_facilities
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Facility owners can update their own facilities" ON public.facility_facilities
    FOR UPDATE USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Facility owners can delete their own facilities" ON public.facility_facilities
    FOR DELETE USING (owner_id = auth.uid());

-- Fix availability table policies (these should now work since owner_id matches auth.uid())
DROP POLICY IF EXISTS "Facility owners can manage their availability" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Authenticated users can manage availability" ON public.facility_default_availability;

CREATE POLICY "Facility owners can manage their availability" ON public.facility_default_availability
    FOR ALL USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    );

-- Fix other related tables
DROP POLICY IF EXISTS "Allow all operations on amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Allow all operations on features" ON public.facility_features;

CREATE POLICY "Facility owners can manage their amenities" ON public.facility_amenities
    FOR ALL USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Facility owners can manage their features" ON public.facility_features
    FOR ALL USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    );

-- Allow public read access to amenities and features for approved facilities
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