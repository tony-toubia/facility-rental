-- Diagnostic script to check current database state
-- Run this to understand what exists and what's missing

-- 1. Check if facility_facilities table exists and what columns it has
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'facility_facilities' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if facility_reviews table exists
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

-- 3. Check what enum types exist
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%facility%' OR t.typname LIKE '%review%'
ORDER BY t.typname, e.enumsortorder;

-- 4. Check if there are any facilities in the database
SELECT 
    id,
    name,
    status,
    created_at
FROM public.facility_facilities 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check current RLS policies on facility_facilities
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'facility_facilities';

-- 6. Check if the status column actually exists in facility_facilities
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'facility_facilities' 
    AND table_schema = 'public' 
    AND column_name = 'status';