-- Simple version: Just create the facility_reviews table
-- Run this if the full version has issues

-- Create the facility_reviews table
CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    
    -- Basic Info Section
    basic_info_status TEXT DEFAULT 'pending',
    basic_info_comments TEXT DEFAULT '',
    
    -- Description Section
    description_status TEXT DEFAULT 'pending',
    description_comments TEXT DEFAULT '',
    
    -- Location Section
    location_status TEXT DEFAULT 'pending',
    location_comments TEXT DEFAULT '',
    
    -- Pricing Section
    pricing_status TEXT DEFAULT 'pending',
    pricing_comments TEXT DEFAULT '',
    
    -- Amenities Section
    amenities_status TEXT DEFAULT 'pending',
    amenities_comments TEXT DEFAULT '',
    
    -- Features Section
    features_status TEXT DEFAULT 'pending',
    features_comments TEXT DEFAULT '',
    
    -- Images Section
    images_status TEXT DEFAULT 'pending',
    images_comments TEXT DEFAULT '',
    
    -- Policies Section (cancellation policy, house rules)
    policies_status TEXT DEFAULT 'pending',
    policies_comments TEXT DEFAULT '',
    
    -- General Section
    general_comments TEXT DEFAULT '',
    
    -- Overall Status
    status TEXT DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per facility
    UNIQUE(facility_id)
);

-- Enable RLS
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "Allow all for authenticated users" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON public.facility_reviews TO authenticated;