-- Complete RLS policies for facility_facilities table
-- (Run this if you want comprehensive RLS coverage)

-- Policy for facility owners to read their own facilities (any status)
CREATE POLICY "Facility owners can read their own facilities" ON public.facility_facilities
    FOR SELECT USING (owner_id = auth.uid());

-- Policy for facility owners to insert new facilities
CREATE POLICY "Facility owners can create facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Policy for facility owners to update their own facilities (already exists from your migration)
-- CREATE POLICY "Facility owners can update their facility visibility" ON public.facility_facilities
--     FOR UPDATE USING (owner_id = auth.uid())
--     WITH CHECK (owner_id = auth.uid());

-- Policy for admins to read all facilities (if you have admin roles)
-- CREATE POLICY "Admins can read all facilities" ON public.facility_facilities
--     FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for admins to update facility status (if you have admin roles)
-- CREATE POLICY "Admins can update facility status" ON public.facility_facilities
--     FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin')
--     WITH CHECK (auth.jwt() ->> 'role' = 'admin');