-- Show the actual structure of the existing facility_reviews table

-- 1. Show all columns in the facility_reviews table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Show table constraints
SELECT 
    constraint_name,
    constraint_type,
    column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc 
    ON kcu.constraint_name = tc.constraint_name
WHERE kcu.table_name = 'facility_reviews' 
    AND kcu.table_schema = 'public';

-- 3. Show a sample of existing data (if any)
SELECT * FROM public.facility_reviews LIMIT 3;