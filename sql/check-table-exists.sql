-- Check if facility_reviews table actually exists

-- 1. Check if table exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public';

-- 2. If table exists, show all columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check table constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public';

-- 4. Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'facility_reviews';

-- 5. If table doesn't exist, create it now
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

-- 6. Ensure RLS and permissions
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_reviews;
CREATE POLICY "allow_all_authenticated" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

GRANT ALL ON public.facility_reviews TO authenticated;