-- Create facility_reviews table and fix the function type issues

-- First, create the table (this should work)
CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    
    basic_info_status TEXT DEFAULT 'pending',
    basic_info_comments TEXT DEFAULT '',
    description_status TEXT DEFAULT 'pending',
    description_comments TEXT DEFAULT '',
    location_status TEXT DEFAULT 'pending',
    location_comments TEXT DEFAULT '',
    pricing_status TEXT DEFAULT 'pending',
    pricing_comments TEXT DEFAULT '',
    amenities_status TEXT DEFAULT 'pending',
    amenities_comments TEXT DEFAULT '',
    features_status TEXT DEFAULT 'pending',
    features_comments TEXT DEFAULT '',
    images_status TEXT DEFAULT 'pending',
    images_comments TEXT DEFAULT '',
    policies_status TEXT DEFAULT 'pending',
    policies_comments TEXT DEFAULT '',
    general_comments TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(facility_id)
);

-- Enable RLS and permissions
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_authenticated" ON public.facility_reviews FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT ALL ON public.facility_reviews TO authenticated;

-- Create helper function that checks if facility needs resubmission
CREATE OR REPLACE FUNCTION facility_needs_resubmission(facility_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.facility_reviews 
        WHERE facility_reviews.facility_id = $1 
        AND (
            basic_info_status = 'needs_changes' OR
            description_status = 'needs_changes' OR
            location_status = 'needs_changes' OR
            pricing_status = 'needs_changes' OR
            amenities_status = 'needs_changes' OR
            features_status = 'needs_changes' OR
            images_status = 'needs_changes' OR
            policies_status = 'needs_changes'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create resubmit function with proper type casting
CREATE OR REPLACE FUNCTION resubmit_facility_for_review(facility_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current user owns this facility
    IF NOT EXISTS (
        SELECT 1 FROM public.facility_facilities 
        WHERE id = $1 AND owner_id = get_current_facility_user_id()
    ) THEN
        RAISE EXCEPTION 'You can only resubmit your own facilities';
    END IF;
    
    -- Update facility status with proper type casting
    UPDATE public.facility_facilities 
    SET status = 'pending_approval'::text, updated_at = NOW()
    WHERE id = $1;
    
    -- Reset review status to pending for sections that needed changes
    UPDATE public.facility_reviews 
    SET 
        basic_info_status = CASE WHEN basic_info_status = 'needs_changes' THEN 'pending' ELSE basic_info_status END,
        description_status = CASE WHEN description_status = 'needs_changes' THEN 'pending' ELSE description_status END,
        location_status = CASE WHEN location_status = 'needs_changes' THEN 'pending' ELSE location_status END,
        pricing_status = CASE WHEN pricing_status = 'needs_changes' THEN 'pending' ELSE pricing_status END,
        amenities_status = CASE WHEN amenities_status = 'needs_changes' THEN 'pending' ELSE amenities_status END,
        features_status = CASE WHEN features_status = 'needs_changes' THEN 'pending' ELSE features_status END,
        images_status = CASE WHEN images_status = 'needs_changes' THEN 'pending' ELSE images_status END,
        policies_status = CASE WHEN policies_status = 'needs_changes' THEN 'pending' ELSE policies_status END,
        status = 'pending',
        updated_at = NOW()
    WHERE facility_reviews.facility_id = $1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get current facility user ID
CREATE OR REPLACE FUNCTION get_current_facility_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM public.facility_users 
        WHERE auth_user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION facility_needs_resubmission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resubmit_facility_for_review(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_facility_user_id() TO authenticated;