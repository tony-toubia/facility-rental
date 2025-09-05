-- Create missing enum types and facility_reviews table
-- This fixes the "column status does not exist" error

-- Create the facility_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE facility_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'needs_changes');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the facility_price_unit enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE facility_price_unit AS ENUM ('hour', 'day', 'week', 'month');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the review_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'needs_changes');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Now create the facility_reviews table
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