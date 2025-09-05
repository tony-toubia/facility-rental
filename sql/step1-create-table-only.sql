-- Step 1: Create ONLY the facility_reviews table
-- Run this first, then test the admin page

CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    
    -- All the review columns the admin page expects
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

-- Basic permissions
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_authenticated" ON public.facility_reviews FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
GRANT ALL ON public.facility_reviews TO authenticated;