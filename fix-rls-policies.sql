-- Fix RLS policies for facility_users table
-- Run this in your Supabase SQL Editor

-- First, let's update the RLS policy for facility_users to allow inserts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.facility_users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.facility_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.facility_users;

-- Create more permissive policies for development
CREATE POLICY "Allow authenticated users to insert profiles" ON public.facility_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view profiles" ON public.facility_users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.facility_users
    FOR UPDATE USING (auth.uid()::text = auth_user_id);

-- Also update policies for other tables to be more permissive during development
-- facility_facilities
DROP POLICY IF EXISTS "Owners can manage their facilities" ON public.facility_facilities;
DROP POLICY IF EXISTS "Everyone can view active facilities" ON public.facility_facilities;

CREATE POLICY "Allow authenticated users to insert facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow everyone to view facilities" ON public.facility_facilities
    FOR SELECT USING (true);

CREATE POLICY "Allow owners to update their facilities" ON public.facility_facilities
    FOR UPDATE USING (owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text));

-- facility_bookings
DROP POLICY IF EXISTS "Users can manage their bookings" ON public.facility_bookings;
DROP POLICY IF EXISTS "Facility owners can view bookings" ON public.facility_bookings;

CREATE POLICY "Allow authenticated users to insert bookings" ON public.facility_bookings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view their own bookings" ON public.facility_bookings
    FOR SELECT USING (user_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text));

CREATE POLICY "Allow facility owners to view bookings for their facilities" ON public.facility_bookings
    FOR SELECT USING (facility_id IN (
        SELECT f.id FROM public.facility_facilities f
        JOIN public.facility_users u ON f.owner_id = u.id
        WHERE u.auth_user_id = auth.uid()::text
    ));

-- For development: Temporarily disable RLS on some tables (you can re-enable later)
-- Uncomment these lines if you want to disable RLS completely for testing:
-- ALTER TABLE public.facility_categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.facility_images DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.facility_amenities DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.facility_features DISABLE ROW LEVEL SECURITY;

-- Or create permissive policies for these tables:
CREATE POLICY "Allow all operations on categories" ON public.facility_categories
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on images" ON public.facility_images
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on amenities" ON public.facility_amenities
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on features" ON public.facility_features
    FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.facility_users TO authenticated;
GRANT ALL ON public.facility_facilities TO authenticated;
GRANT ALL ON public.facility_bookings TO authenticated;
GRANT ALL ON public.facility_categories TO authenticated;
GRANT ALL ON public.facility_images TO authenticated;
GRANT ALL ON public.facility_amenities TO authenticated;
GRANT ALL ON public.facility_features TO authenticated;