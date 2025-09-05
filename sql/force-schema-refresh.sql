-- Force Supabase to refresh its schema cache

-- Method 1: Update table metadata to trigger cache refresh
COMMENT ON TABLE public.facility_reviews IS 'Facility review data - cache refresh ' || NOW();

-- Method 2: Grant permissions again to ensure they're properly set
REVOKE ALL ON public.facility_reviews FROM authenticated;
GRANT ALL ON public.facility_reviews TO authenticated;

-- Method 3: Drop and recreate RLS policies to refresh cache
DROP POLICY IF EXISTS "allow_all_authenticated" ON public.facility_reviews;
CREATE POLICY "allow_all_authenticated" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Method 4: Analyze the table to update statistics
ANALYZE public.facility_reviews;

-- Method 5: Refresh materialized views (if any exist)
-- This forces PostgreSQL to refresh its internal caches
SELECT pg_reload_conf();

-- Verify all columns exist
SELECT 
    'facility_reviews' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public'
    AND column_name LIKE '%comments%'
ORDER BY column_name;