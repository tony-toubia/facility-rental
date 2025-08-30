-- Enable PostGIS extension (run this first if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add latitude and longitude columns to facility_facilities table if they don't exist
ALTER TABLE facility_facilities 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- First, let's check the actual structure of the facility_facilities table
-- Run this query to see the column types:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'facility_facilities' 
ORDER BY ordinal_position;

-- Function to get facilities within a radius (in miles)
-- Updated to match the actual table structure
CREATE OR REPLACE FUNCTION get_facilities_within_radius(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_miles DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price NUMERIC,
  price_unit TEXT,
  capacity INTEGER,
  rating NUMERIC,
  review_count INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ,
  owner_id UUID,
  distance NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.type,
    f.description,
    f.address,
    f.city,
    f.state,
    f.latitude::DOUBLE PRECISION,
    f.longitude::DOUBLE PRECISION,
    f.price,
    f.price_unit,
    f.capacity,
    f.rating,
    f.review_count,
    f.status,
    f.created_at,
    f.owner_id,
    -- Calculate distance in miles using PostGIS
    ROUND(
      (ST_Distance(
        ST_Point(center_lng, center_lat)::geography,
        ST_Point(f.longitude, f.latitude)::geography
      ) * 0.000621371)::numeric, -- Convert meters to miles
      1
    ) as distance
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
  ORDER BY distance ASC;
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

-- Test the function with Baltimore coordinates (should return 0 initially since no facilities have coordinates)
SELECT * FROM get_facilities_within_radius(39.0458, -76.6413, 25);

-- Check current facility data
SELECT 
  id, 
  name, 
  city, 
  state, 
  latitude, 
  longitude,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'Has coordinates'
    ELSE 'Needs geocoding'
  END as coordinate_status
FROM facility_facilities 
WHERE status = 'active'
ORDER BY name;