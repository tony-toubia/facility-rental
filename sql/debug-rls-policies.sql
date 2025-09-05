-- Debug RLS policies - create very permissive policies to test
-- This will help us identify if the issue is with the policy logic or something else

-- First, let's see what policies currently exist
-- Run this query to check existing policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'facility_facilities';

-- Drop ALL existing policies on facility_facilities
DROP POLICY IF EXISTS "Authenticated users can create facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Everyone can view approved active facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can view their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can update their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can delete their own facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow authenticated users to insert facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow everyone to view facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow owners to update their facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facilities are publicly readable" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can manage their facilities" ON public.facility_facilities;

-- Create a very simple policy for testing
CREATE POLICY "Allow all authenticated users to do everything" ON public.facility_facilities
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Also create simple policies for availability tables
DROP POLICY IF EXISTS "Facility owners can manage their availability" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Anyone can read availability for approved facilities" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Authenticated users can manage availability" ON public.facility_default_availability;

CREATE POLICY "Allow all authenticated users to manage availability" ON public.facility_default_availability
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Same for availability exceptions
DROP POLICY IF EXISTS "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Anyone can read availability exceptions for approved facilities" ON public.facility_availability_exceptions;

CREATE POLICY "Allow all authenticated users to manage availability exceptions" ON public.facility_availability_exceptions
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Same for holiday selections
DROP POLICY IF EXISTS "Facility owners can manage their holiday selections" ON public.facility_selected_holidays;

CREATE POLICY "Allow all authenticated users to manage holiday selections" ON public.facility_selected_holidays
    FOR ALL 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Check if RLS is enabled on the table
-- If this doesn't work, we might need to disable RLS temporarily
-- ALTER TABLE public.facility_facilities DISABLE ROW LEVEL SECURITY;