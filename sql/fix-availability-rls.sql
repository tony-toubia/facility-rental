-- Fix RLS policies for facility availability tables
-- The issue is that during facility creation, the availability data is being inserted
-- but the RLS policy is too restrictive for new facilities

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Facility owners can manage their availability" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Facility owners can manage their holiday selections" ON public.facility_selected_holidays;

-- Create new policies that allow facility owners to manage their availability data
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

CREATE POLICY "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions
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

CREATE POLICY "Facility owners can manage their holiday selections" ON public.facility_selected_holidays
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