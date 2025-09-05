-- Final working RLS policies with proper type casting
-- Fixed the UUID = TEXT type mismatch error

-- Drop the debug policies
DROP POLICY IF EXISTS "Allow all authenticated users to do everything" ON public.facility_facilities;
DROP POLICY IF EXISTS "Allow all authenticated users to manage availability" ON public.facility_default_availability;
DROP POLICY IF EXISTS "Allow all authenticated users to manage availability exceptions" ON public.facility_availability_exceptions;
DROP POLICY IF EXISTS "Allow all authenticated users to manage holiday selections" ON public.facility_selected_holidays;

-- Create proper policies for facility_facilities
-- INSERT: Any authenticated user can create facilities (we'll validate owner_id in application logic)
CREATE POLICY "Authenticated users can create facilities" ON public.facility_facilities
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: Users can see approved+active facilities OR their own facilities
CREATE POLICY "Users can view approved facilities or their own" ON public.facility_facilities
    FOR SELECT USING (
        (status = 'approved' AND is_active = true) OR
        (owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text))
    );

-- UPDATE: Users can only update their own facilities
CREATE POLICY "Users can update their own facilities" ON public.facility_facilities
    FOR UPDATE USING (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    )
    WITH CHECK (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    );

-- DELETE: Users can only delete their own facilities
CREATE POLICY "Users can delete their own facilities" ON public.facility_facilities
    FOR DELETE USING (
        owner_id IN (SELECT id FROM public.facility_users WHERE auth_user_id = auth.uid()::text)
    );

-- Create policies for availability tables
-- For facility_default_availability
CREATE POLICY "Users can manage availability for their facilities" ON public.facility_default_availability
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    );

-- Public read access to availability for approved facilities
CREATE POLICY "Public can read availability for approved facilities" ON public.facility_default_availability
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

-- For facility_availability_exceptions
CREATE POLICY "Users can manage availability exceptions for their facilities" ON public.facility_availability_exceptions
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    );

-- For facility_selected_holidays
CREATE POLICY "Users can manage holiday selections for their facilities" ON public.facility_selected_holidays
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    );

-- Ensure other related tables have proper policies
-- For facility_amenities
DROP POLICY IF EXISTS "Allow all operations on amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Facility owners can manage their amenities" ON public.facility_amenities;
DROP POLICY IF EXISTS "Public can read amenities for approved facilities" ON public.facility_amenities;

CREATE POLICY "Users can manage amenities for their facilities" ON public.facility_amenities
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Public can read amenities for approved facilities" ON public.facility_amenities
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

-- For facility_features
DROP POLICY IF EXISTS "Allow all operations on features" ON public.facility_features;
DROP POLICY IF EXISTS "Facility owners can manage their features" ON public.facility_features;
DROP POLICY IF EXISTS "Public can read features for approved facilities" ON public.facility_features;

CREATE POLICY "Users can manage features for their facilities" ON public.facility_features
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            facility_id IN (
                SELECT f.id FROM public.facility_facilities f
                JOIN public.facility_users u ON f.owner_id = u.id
                WHERE u.auth_user_id = auth.uid()::text
            )
        )
    );

CREATE POLICY "Public can read features for approved facilities" ON public.facility_features
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );