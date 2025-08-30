-- Fix the ID column to have proper default value
-- First, let's see the current structure
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'facility_categories' 
ORDER BY ordinal_position;

-- Fix the ID column to have a proper default
ALTER TABLE facility_categories ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Also ensure the column order is correct by checking what columns exist
\d facility_categories;