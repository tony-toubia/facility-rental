-- Check current policies on facility_facilities table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'facility_facilities';

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE facility_facilities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON facility_facilities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON facility_facilities;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON facility_facilities;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON facility_facilities;

-- Create policies that allow anonymous read access for active facilities
CREATE POLICY "Enable read access for all users" ON facility_facilities
    FOR SELECT USING (status = 'active');

-- Allow authenticated users to insert facilities
CREATE POLICY "Enable insert for authenticated users only" ON facility_facilities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own facilities
CREATE POLICY "Enable update for users based on owner_id" ON facility_facilities
    FOR UPDATE USING (auth.uid() = owner_id);

-- Allow users to delete their own facilities
CREATE POLICY "Enable delete for users based on owner_id" ON facility_facilities
    FOR DELETE USING (auth.uid() = owner_id);

-- Check if the PostGIS function has proper permissions
-- Grant execute permission to anonymous users for the PostGIS function
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- Test the policies by running a simple select as anonymous user
SELECT id, name, status FROM facility_facilities WHERE status = 'active' LIMIT 3;

-- Test the PostGIS function
SELECT * FROM get_facilities_within_radius(39.0267, -94.6275, 25) LIMIT 3;