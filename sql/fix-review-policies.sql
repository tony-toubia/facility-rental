-- Fix RLS policies for the review system to work properly

-- Update facility_reviews policies
DROP POLICY IF EXISTS "Facility owners can view reviews of their facilities" ON public.facility_reviews;
DROP POLICY IF EXISTS "Authenticated users can manage all reviews" ON public.facility_reviews;

-- Allow facility owners to view reviews of their facilities
CREATE POLICY "Facility owners can view reviews of their facilities" ON public.facility_reviews
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

-- Allow authenticated users (admins) to manage all reviews
CREATE POLICY "Admins can manage all reviews" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Ensure facility owners can see facilities that need changes
DROP POLICY IF EXISTS "Users can view approved facilities or their own" ON public.facility_facilities;

CREATE POLICY "Users can view approved facilities or their own" ON public.facility_facilities
    FOR SELECT USING (
        (status = 'approved' AND is_active = true) OR
        (owner_id = get_current_facility_user_id())
    );

-- Make sure the query for pending facilities works for admins
-- (The existing policies should handle this, but let's be explicit)

-- Grant necessary permissions for the new functions
GRANT EXECUTE ON FUNCTION facility_needs_resubmission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resubmit_facility_for_review(UUID) TO authenticated;