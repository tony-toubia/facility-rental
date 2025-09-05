-- Minimal facility_reviews table creation - no functions, no complex features
-- This should work without any "status" column errors

-- Just create the basic table
CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL,
    
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint separately (safer)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'facility_reviews_facility_id_fkey'
    ) THEN
        ALTER TABLE public.facility_reviews 
        ADD CONSTRAINT facility_reviews_facility_id_fkey 
        FOREIGN KEY (facility_id) REFERENCES public.facility_facilities(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add unique constraint separately (safer)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'facility_reviews_facility_id_unique'
    ) THEN
        ALTER TABLE public.facility_reviews 
        ADD CONSTRAINT facility_reviews_facility_id_unique UNIQUE(facility_id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'facility_reviews' AND policyname = 'allow_all_authenticated'
    ) THEN
        CREATE POLICY "allow_all_authenticated" ON public.facility_reviews
            FOR ALL USING (auth.uid() IS NOT NULL)
            WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.facility_reviews TO authenticated;