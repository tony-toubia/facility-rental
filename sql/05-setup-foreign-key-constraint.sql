-- Step 5: Setup foreign key constraint for category assignments
-- Add foreign key constraint to facility_category_assignments if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'facility_category_assignments' 
                   AND constraint_type = 'FOREIGN KEY' 
                   AND constraint_name LIKE '%category_id%') THEN
        ALTER TABLE facility_category_assignments 
        ADD CONSTRAINT facility_category_assignments_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES facility_categories(category_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS on tables if not already enabled
ALTER TABLE facility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_category_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON facility_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON facility_category_assignments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON facility_category_assignments;
DROP POLICY IF EXISTS "Enable update for users based on facility owner" ON facility_category_assignments;
DROP POLICY IF EXISTS "Enable delete for users based on facility owner" ON facility_category_assignments;

-- Create policies for facility_categories (read-only for all users)
CREATE POLICY "Enable read access for all users" ON facility_categories
    FOR SELECT USING (true);

-- Create policies for facility_category_assignments
CREATE POLICY "Enable read access for all users" ON facility_category_assignments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON facility_category_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on facility owner" ON facility_category_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE facility_facilities.id = facility_category_assignments.facility_id 
            AND facility_facilities.owner_id = auth.uid()
        )
    );

CREATE POLICY "Enable delete for users based on facility owner" ON facility_category_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE facility_facilities.id = facility_category_assignments.facility_id 
            AND facility_facilities.owner_id = auth.uid()
        )
    );