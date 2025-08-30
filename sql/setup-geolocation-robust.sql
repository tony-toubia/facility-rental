-- Enable PostGIS extension (run this first if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add latitude and longitude columns to facility_facilities table if they don't exist
ALTER TABLE facility_facilities 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);

-- Create a robust function that handles ENUM types and potential NULL values
CREATE OR REPLACE FUNCTION get_facilities_within_radius(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION
)
RETURNS TABLE (
  facility_id UUID,
  facility_name TEXT,
  facility_type TEXT,
  facility_description TEXT,
  facility_address TEXT,
  facility_city TEXT,
  facility_state TEXT,
  facility_latitude DOUBLE PRECISION,
  facility_longitude DOUBLE PRECISION,
  facility_price NUMERIC,
  facility_price_unit TEXT,
  facility_capacity INTEGER,
  facility_rating NUMERIC,
  facility_review_count INTEGER,
  facility_status TEXT,
  facility_created_at TIMESTAMPTZ,
  facility_owner_id UUID,
  distance_miles NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as facility_id,
    COALESCE(f.name, '')::TEXT as facility_name,
    COALESCE(f.type, '')::TEXT as facility_type,
    COALESCE(f.description, '')::TEXT as facility_description,
    COALESCE(f.address, '')::TEXT as facility_address,
    COALESCE(f.city, '')::TEXT as facility_city,
    COALESCE(f.state, '')::TEXT as facility_state,
    COALESCE(f.latitude, 0)::DOUBLE PRECISION as facility_latitude,
    COALESCE(f.longitude, 0)::DOUBLE PRECISION as facility_longitude,
    COALESCE(f.price, 0)::NUMERIC as facility_price,
    COALESCE(f.price_unit::TEXT, 'hour')::TEXT as facility_price_unit, -- Cast ENUM to TEXT with default
    COALESCE(f.capacity, 0)::INTEGER as facility_capacity,
    COALESCE(f.rating, 0)::NUMERIC as facility_rating,
    COALESCE(f.review_count, 0)::INTEGER as facility_review_count,
    COALESCE(f.status, 'active')::TEXT as facility_status,
    f.created_at as facility_created_at,
    f.owner_id as facility_owner_id,
    -- Calculate distance in miles using PostGIS
    ROUND(
      (ST_Distance(
        ST_Point(center_lng, center_lat)::geography,
        ST_Point(COALESCE(f.longitude, 0), COALESCE(f.latitude, 0))::geography
      ) * 0.000621371)::numeric, -- Convert meters to miles
      1
    ) as distance_miles
  FROM facility_facilities f
  WHERE 
    f.status = 'active'
    AND f.latitude IS NOT NULL 
    AND f.longitude IS NOT NULL
    AND ST_DWithin(
      ST_Point(center_lng, center_lat)::geography,
      ST_Point(f.longitude, f.latitude)::geography,
      radius_miles * 1609.34 -- Convert miles to meters
    )
  ORDER BY distance_miles ASC;
END;
$$;

-- Function to update facility coordinates
CREATE OR REPLACE FUNCTION update_facility_coordinates(
  facility_id UUID,
  new_latitude DOUBLE PRECISION,
  new_longitude DOUBLE PRECISION
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE facility_facilities 
  SET 
    latitude = new_latitude,
    longitude = new_longitude
  WHERE id = facility_id;
  
  RETURN FOUND;
END;
$$;

-- Function to get nearby facilities count
CREATE OR REPLACE FUNCTION get_nearby_facilities_count(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  facility_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO facility_count
  FROM facility_facilities f
  WHERE 
    f.status = 'active'
    AND f.latitude IS NOT NULL 
    AND f.longitude IS NOT NULL
    AND ST_DWithin(
      ST_Point(center_lng, center_lat)::geography,
      ST_Point(f.longitude, f.latitude)::geography,
      radius_miles * 1609.34
    );
  
  RETURN facility_count;
END;
$$;

-- Test the function with Baltimore coordinates
SELECT * FROM get_facilities_within_radius(39.0458, -76.6413, 25);

-- Check current facility data
SELECT 
  id, 
  name, 
  city, 
  state, 
  latitude, 
  longitude,
  price_unit,
  pg_typeof(price_unit) as price_unit_type,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'Has coordinates'
    ELSE 'Needs geocoding'
  END as coordinate_status
FROM facility_facilities 
WHERE status = 'active'
ORDER BY name;