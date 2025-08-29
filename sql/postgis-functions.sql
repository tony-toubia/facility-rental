-- Enable PostGIS extension (run this first if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to get facilities within a radius using PostGIS
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
  facility_users JSONB,
  facility_images JSONB,
  facility_amenities JSONB,
  facility_features JSONB
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
    -- Calculate distance in miles
    (ST_Distance(
      ST_GeogFromText('POINT(' || center_lng || ' ' || center_lat || ')'),
      ST_GeogFromText('POINT(' || f.longitude || ' ' || f.latitude || ')')
    ) * 0.000621371)::DOUBLE PRECISION AS distance_miles,
    -- Get related data as JSON
    (
      SELECT jsonb_build_object(
        'first_name', u.first_name,
        'last_name', u.last_name,
        'email', u.email
      )
      FROM facility_users u 
      WHERE u.id = f.owner_id
    ) AS facility_users,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'image_url', fi.image_url,
          'is_primary', fi.is_primary
        )
      )
      FROM facility_images fi 
      WHERE fi.facility_id = f.id
    ) AS facility_images,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', fa.name,
          'icon_name', fa.icon_name
        )
      )
      FROM facility_amenities fa 
      WHERE fa.facility_id = f.id
    ) AS facility_amenities,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', ff.name
        )
      )
      FROM facility_features ff 
      WHERE ff.facility_id = f.id
    ) AS facility_features
  FROM facility_facilities f
  WHERE 
    f.status = 'active'
    AND f.latitude IS NOT NULL 
    AND f.longitude IS NOT NULL
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || center_lng || ' ' || center_lat || ')'),
      ST_GeogFromText('POINT(' || f.longitude || ' ' || f.latitude || ')'),
      radius_meters
    )
  ORDER BY 
    ST_Distance(
      ST_GeogFromText('POINT(' || center_lng || ' ' || center_lat || ')'),
      ST_GeogFromText('POINT(' || f.longitude || ' ' || f.latitude || ')')
    );
END;
$$ LANGUAGE plpgsql;

-- Function to geocode and store facility location
CREATE OR REPLACE FUNCTION update_facility_coordinates(
  facility_id UUID,
  new_latitude DOUBLE PRECISION,
  new_longitude DOUBLE PRECISION
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE facility_facilities 
  SET 
    latitude = new_latitude,
    longitude = new_longitude,
    updated_at = NOW()
  WHERE id = facility_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby facilities count for a location
CREATE OR REPLACE FUNCTION get_nearby_facilities_count(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 40233.6
)
RETURNS INTEGER AS $$
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
      ST_GeogFromText('POINT(' || center_lng || ' ' || center_lat || ')'),
      ST_GeogFromText('POINT(' || f.longitude || ' ' || f.latitude || ')'),
      radius_meters
    );
    
  RETURN facility_count;
END;
$$ LANGUAGE plpgsql;

-- Create spatial index for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_facility_facilities_location 
ON facility_facilities 
USING GIST (ST_Point(longitude::double precision, latitude::double precision));

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_facilities_within_radius TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_facility_coordinates TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_facilities_count TO anon, authenticated;