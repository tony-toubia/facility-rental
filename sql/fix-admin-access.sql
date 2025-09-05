-- Fix admin access to facilities for the review system
-- This script ensures that authenticated users can access facilities for admin review

-- First, let's check what policies exist
-- (Run this to see current policies)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('facility_facilities', 'facility_reviews', 'facility_amenities', 'facility_features', 'facility_images');

-- Drop existing restrictive policies that might block admin access
DROP POLICY IF EXISTS "Users can view approved facilities or their own" ON public.facility_facilities;
DROP POLICY IF EXISTS "Facility owners can view reviews of their facilities" ON public.facility_reviews;

-- Create more permissive policies for admin access
-- Allow authenticated users to view all facilities (for admin review)
CREATE POLICY "Authenticated users can view all facilities" ON public.facility_facilities
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to view all reviews (for admin purposes)
CREATE POLICY "Authenticated users can view all reviews" ON public.facility_reviews
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage reviews (create, update, delete)
CREATE POLICY "Authenticated users can manage reviews" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure facility amenities, features, and images are accessible
DROP POLICY IF EXISTS "Enable read access for all users" ON public.facility_amenities;
CREATE POLICY "Authenticated users can view amenities" ON public.facility_amenities
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.facility_features;
CREATE POLICY "Authenticated users can view features" ON public.facility_features
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.facility_images;
CREATE POLICY "Authenticated users can view images" ON public.facility_images
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Ensure facility_users table is accessible for admin queries
DROP POLICY IF EXISTS "Users can view their own profile" ON public.facility_users;
CREATE POLICY "Authenticated users can view user profiles" ON public.facility_users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT ON public.facility_facilities TO authenticated;
GRANT SELECT ON public.facility_reviews TO authenticated;
GRANT ALL ON public.facility_reviews TO authenticated;
GRANT SELECT ON public.facility_amenities TO authenticated;
GRANT SELECT ON public.facility_features TO authenticated;
GRANT SELECT ON public.facility_images TO authenticated;
GRANT SELECT ON public.facility_users TO authenticated;

-- Ensure the review functions are accessible
GRANT EXECUTE ON FUNCTION facility_needs_resubmission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resubmit_facility_for_review(UUID) TO authenticated;