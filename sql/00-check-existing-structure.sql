-- Check existing table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('facility_categories', 'facility_facilities', 'facility_category_assignments')
ORDER BY table_name, ordinal_position;