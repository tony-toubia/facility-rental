-- Verify the facility_reviews table was created and refresh schema cache

-- 1. Check if the table exists and has all required columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Specifically check for the amenities_comments column
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public'
    AND column_name = 'amenities_comments';

-- 3. Check if there are any existing records in the table
SELECT COUNT(*) as record_count FROM public.facility_reviews;

-- 4. Test inserting a sample record to verify the table structure
INSERT INTO public.facility_reviews (
    facility_id,
    amenities_comments,
    basic_info_comments
) 
SELECT 
    id as facility_id,
    'Test amenities comment' as amenities_comments,
    'Test basic info comment' as basic_info_comments
FROM public.facility_facilities 
LIMIT 1
ON CONFLICT (facility_id) DO UPDATE SET
    amenities_comments = EXCLUDED.amenities_comments,
    basic_info_comments = EXCLUDED.basic_info_comments;

-- 5. Verify the insert worked
SELECT 
    id,
    facility_id,
    amenities_comments,
    basic_info_comments,
    created_at
FROM public.facility_reviews
LIMIT 5;

-- 6. Force refresh the schema cache by updating table comment
COMMENT ON TABLE public.facility_reviews IS 'Admin review data for facilities - updated ' || NOW();