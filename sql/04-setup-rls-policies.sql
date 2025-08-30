-- Step 4: Setup RLS and Policies
-- Enable RLS on new tables
ALTER TABLE facility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_category_assignments ENABLE ROW LEVEL SECURITY;

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