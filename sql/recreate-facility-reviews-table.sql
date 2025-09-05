-- Recreate the facility_reviews table with the correct structure
-- WARNING: This will delete any existing review data

-- 1. Drop the existing table (this will also drop all policies)
DROP TABLE IF EXISTS public.facility_reviews CASCADE;

-- 2. Create the table with the correct structure
CREATE TABLE public.facility_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
    
    -- Policies Section
    policies_status TEXT DEFAULT 'pending',
    policies_comments TEXT DEFAULT '',
    
    -- General Section
    general_comments TEXT DEFAULT '',
    
    -- Overall Status
    status TEXT DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(facility_id)
);

-- 3. Enable RLS
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy
CREATE POLICY "allow_all_authenticated" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Grant permissions
GRANT ALL ON public.facility_reviews TO authenticated;

-- 6. Create update trigger
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

-- 7. Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;