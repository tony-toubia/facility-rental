-- Part 2: Add listing visibility control (run after Part 1 is committed)
-- This separates approval status from listing visibility

-- Step 1: Add is_active column
ALTER TABLE public.facility_facilities 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Migrate existing data
-- All facilities with 'active' status become 'approved' with is_active = true
UPDATE public.facility_facilities 
SET 
  status = 'approved'::facility_status,
  is_active = true
WHERE status = 'active'::facility_status;

-- Step 3: Set default for new facilities
-- New facilities will be pending_approval with is_active = false initially
ALTER TABLE public.facility_facilities 
ALTER COLUMN is_active SET DEFAULT false;

-- Step 4: Update the review trigger to set is_active = true when approving
CREATE OR REPLACE FUNCTION update_facility_status_on_review()
RETURNS TRIGGER AS $$
BEGIN
    -- If review is approved, set facility to approved and make it active
    IF NEW.status = 'approved' THEN
        UPDATE public.facility_facilities 
        SET 
          status = 'approved'::facility_status,
          is_active = true
        WHERE id = NEW.facility_id;
    -- If review needs changes, set facility to needs_changes and make it inactive
    ELSIF NEW.status = 'needs_changes' THEN
        UPDATE public.facility_facilities 
        SET 
          status = 'needs_changes'::facility_status,
          is_active = false
        WHERE id = NEW.facility_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Update the PostGIS function to check both status and is_active
CREATE OR REPLACE FUNCTION get_facilities_within_radius(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 40233.6 -- 25 miles in meters
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  category_id TEXT,
  name TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  price NUMERIC,
  price_unit facility_price_unit,
  capacity INTEGER,
  min_booking_duration INTEGER,
  max_booking_duration INTEGER,
  advance_booking_days INTEGER,
  cancellation_policy TEXT,
  house_rules TEXT,
  status facility_status,
  is_featured BOOLEAN,
  rating NUMERIC,
  review_count INTEGER,
  total_bookings INTEGER,
  views_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_miles DOUBLE PRECISION,
  categories TEXT[],
  primary_category TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.owner_id,
    f.category_id,
    f.name,
    f.type,
    f.description,
    f.address,
    f.city,
    f.state,
    f.zip_code,
    f.country,
    f.latitude,
    f.longitude,
    f.price,
    f.price_unit,
    f.capacity,
    f.min_booking_duration,
    f.max_booking_duration,
    f.advance_booking_days,
    f.cancellation_policy,
    f.house_rules,
    f.status,
    f.is_featured,
    f.rating,
    f.review_count,
    f.total_bookings,
    f.views_count,
    f.created_at,
    f.updated_at,
    ST_Distance(
      ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
      ST_Transform(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326), 3857)
    ) / 1609.34 as distance_miles,
    ARRAY(
        SELECT fc.name 
        FROM facility_category_assignments fca 
        JOIN facility_categories fc ON fca.category_id = fc.category_id 
        WHERE fca.facility_id = f.id
        ORDER BY fca.is_primary DESC, fc.name
    ) as categories,
    (
        SELECT fc.name 
        FROM facility_category_assignments fca 
        JOIN facility_categories fc ON fca.category_id = fc.category_id 
        WHERE fca.facility_id = f.id AND fca.is_primary = true
        LIMIT 1
    ) as primary_category,
    f.is_active
  FROM facility_facilities f
  WHERE f.status = 'approved'
  AND f.is_active = true
  AND f.latitude IS NOT NULL 
  AND f.longitude IS NOT NULL
  AND ST_DWithin(
    ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
    ST_Transform(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326), 3857),
    radius_meters
  )
  ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;

-- Step 6: Add RLS policy for facility owners to update is_active
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'facility_facilities' 
        AND policyname = 'Facility owners can update their facility visibility'
    ) THEN
        CREATE POLICY "Facility owners can update their facility visibility" ON public.facility_facilities
            FOR UPDATE USING (owner_id = auth.uid())
            WITH CHECK (owner_id = auth.uid());
    END IF;
END $$;