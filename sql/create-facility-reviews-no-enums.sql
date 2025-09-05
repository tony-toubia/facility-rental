-- Create facility_reviews table without enums (safest approach)
-- This avoids any enum-related issues

-- Create the facility_reviews table using TEXT instead of enums
CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    
    -- Basic Info Section
    basic_info_status TEXT DEFAULT 'pending' CHECK (basic_info_status IN ('pending', 'approved', 'needs_changes')),
    basic_info_comments TEXT DEFAULT '',
    
    -- Description Section
    description_status TEXT DEFAULT 'pending' CHECK (description_status IN ('pending', 'approved', 'needs_changes')),
    description_comments TEXT DEFAULT '',
    
    -- Location Section
    location_status TEXT DEFAULT 'pending' CHECK (location_status IN ('pending', 'approved', 'needs_changes')),
    location_comments TEXT DEFAULT '',
    
    -- Pricing Section
    pricing_status TEXT DEFAULT 'pending' CHECK (pricing_status IN ('pending', 'approved', 'needs_changes')),
    pricing_comments TEXT DEFAULT '',
    
    -- Amenities Section
    amenities_status TEXT DEFAULT 'pending' CHECK (amenities_status IN ('pending', 'approved', 'needs_changes')),
    amenities_comments TEXT DEFAULT '',
    
    -- Features Section
    features_status TEXT DEFAULT 'pending' CHECK (features_status IN ('pending', 'approved', 'needs_changes')),
    features_comments TEXT DEFAULT '',
    
    -- Images Section
    images_status TEXT DEFAULT 'pending' CHECK (images_status IN ('pending', 'approved', 'needs_changes')),
    images_comments TEXT DEFAULT '',
    
    -- Policies Section (cancellation policy, house rules)
    policies_status TEXT DEFAULT 'pending' CHECK (policies_status IN ('pending', 'approved', 'needs_changes')),
    policies_comments TEXT DEFAULT '',
    
    -- General Section
    general_comments TEXT DEFAULT '',
    
    -- Overall Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'needs_changes')),
    
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

-- Create simple RLS policy that allows all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant all permissions to authenticated users
GRANT ALL ON public.facility_reviews TO authenticated;

-- Create a simple trigger to update the updated_at timestamp
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