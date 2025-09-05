-- Test if we can directly access the facility_reviews table

-- 1. Simple select to test table access
SELECT * FROM public.facility_reviews LIMIT 1;

-- 2. Test inserting a minimal record
DO $$
DECLARE
    test_facility_id UUID;
BEGIN
    -- Get a facility ID to test with
    SELECT id INTO test_facility_id FROM public.facility_facilities LIMIT 1;
    
    IF test_facility_id IS NOT NULL THEN
        -- Try to insert a test record
        INSERT INTO public.facility_reviews (
            facility_id,
            amenities_comments,
            basic_info_comments,
            status
        ) VALUES (
            test_facility_id,
            'Test amenities comment',
            'Test basic info comment', 
            'pending'
        )
        ON CONFLICT (facility_id) DO UPDATE SET
            amenities_comments = EXCLUDED.amenities_comments,
            basic_info_comments = EXCLUDED.basic_info_comments,
            updated_at = NOW();
            
        RAISE NOTICE 'Successfully inserted/updated test record for facility %', test_facility_id;
    ELSE
        RAISE NOTICE 'No facilities found to test with';
    END IF;
END $$;

-- 3. Verify the test record
SELECT 
    facility_id,
    amenities_comments,
    basic_info_comments,
    status,
    created_at
FROM public.facility_reviews;

-- 4. Clean up test record (optional)
-- DELETE FROM public.facility_reviews WHERE amenities_comments = 'Test amenities comment';