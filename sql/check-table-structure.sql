-- Check the actual structure of the facility_facilities table
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'facility_facilities' 
ORDER BY ordinal_position;

-- Check if there are any ENUM types
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%price_unit%' OR t.typname LIKE '%facility%'
ORDER BY t.typname, e.enumsortorder;

-- Check a sample of actual data to understand the structure
SELECT 
  id,
  name,
  type,
  price,
  price_unit,
  pg_typeof(price_unit) as price_unit_type,
  status,
  latitude,
  longitude
FROM facility_facilities 
LIMIT 3;