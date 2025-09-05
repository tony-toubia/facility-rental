-- Simple schema refresh without complex syntax

-- 1. Check if amenities_comments column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public' 
    AND column_name = 'amenities_comments';

-- 2. Force schema cache refresh by updating table comment
COMMENT ON TABLE public.facility_reviews IS 'Facility reviews table - refreshed';

-- 3. Analyze table to update statistics
ANALYZE public.facility_reviews;

-- 4. Re-grant permissions to ensure they're current
GRANT ALL ON public.facility_reviews TO authenticated;

-- 5. Test a simple insert to verify everything works
DO $$
DECLARE
    test_facility_id UUID;
BEGIN
    -- Get first facility ID
    SELECT id INTO test_facility_id FROM public.facility_facilities LIMIT 1;
    
    IF test_facility_id IS NOT NULL THEN
        -- Insert test data
        INSERT INTO public.facility_reviews (facility_id, amenities_comments) 
        VALUES (test_facility_id, 'Schema refresh test')
        ON CONFLICT (facility_id) DO UPDATE SET amenities_comments = 'Schema refresh test';
        
        RAISE NOTICE 'Test insert successful - schema is working';
    END IF;
END $$;