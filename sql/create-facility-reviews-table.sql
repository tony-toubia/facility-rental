-- Create the missing facility_reviews table
-- This table stores detailed admin review feedback for facilities

-- First, create the review status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'needs_changes');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the facility_reviews table
CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    
    -- Basic Info Section
    basic_info_status review_status DEFAULT 'pending',
    basic_info_comments TEXT DEFAULT '',
    
    -- Description Section
    description_status review_status DEFAULT 'pending',
    description_comments TEXT DEFAULT '',
    
    -- Location Section
    location_status review_status DEFAULT 'pending',
    location_comments TEXT DEFAULT '',
    
    -- Pricing Section
    pricing_status review_status DEFAULT 'pending',
    pricing_comments TEXT DEFAULT '',
    
    -- Amenities Section
    amenities_status review_status DEFAULT 'pending',
    amenities_comments TEXT DEFAULT '',
    
    -- Features Section
    features_status review_status DEFAULT 'pending',
    features_comments TEXT DEFAULT '',
    
    -- Images Section
    images_status review_status DEFAULT 'pending',
    images_comments TEXT DEFAULT '',
    
    -- Policies Section (cancellation policy, house rules)
    policies_status review_status DEFAULT 'pending',
    policies_comments TEXT DEFAULT '',
    
    -- General Section
    general_comments TEXT DEFAULT '',
    
    -- Overall Status
    status review_status DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per facility
    UNIQUE(facility_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_id ON public.facility_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_status ON public.facility_reviews(status);

-- Enable RLS
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to view all reviews (for admin purposes)
CREATE POLICY "Authenticated users can view all reviews" ON public.facility_reviews
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to manage reviews (create, update, delete)
CREATE POLICY "Authenticated users can manage reviews" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT SELECT ON public.facility_reviews TO authenticated;
GRANT INSERT ON public.facility_reviews TO authenticated;
GRANT UPDATE ON public.facility_reviews TO authenticated;
GRANT DELETE ON public.facility_reviews TO authenticated;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_facility_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facility_reviews_updated_at
    BEFORE UPDATE ON public.facility_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_facility_reviews_updated_at();

-- Create helper functions for the review system
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
    
    -- Update facility status to pending_approval
    UPDATE public.facility_facilities 
    SET status = 'pending_approval', updated_at = NOW()
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION facility_needs_resubmission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resubmit_facility_for_review(UUID) TO authenticated;

-- Create a function to get current facility user ID (if it doesn't exist)
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

GRANT EXECUTE ON FUNCTION get_current_facility_user_id() TO authenticated;