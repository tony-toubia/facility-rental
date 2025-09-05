-- Simple PostGIS function for radius-based facility search
-- This function works with the simplified RLS policies

CREATE OR REPLACE FUNCTION get_facilities_within_radius(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    price NUMERIC,
    price_unit TEXT,
    capacity INTEGER,
    status TEXT,
    is_active BOOLEAN,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    owner_id UUID,
    category_id UUID,
    rating NUMERIC,
    review_count INTEGER,
    distance DOUBLE PRECISION
) 
LANGUAGE plpgsql
SECURITY DEFINER
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
        f.zip_code,
        f.country,
        f.latitude,
        f.longitude,
        f.price,
        f.price_unit,
        f.capacity,
        f.status,
        f.is_active,
        f.is_featured,
        f.created_at,
        f.updated_at,
        f.owner_id,
        f.category_id,
        f.rating,
        f.review_count,
        -- Calculate distance in meters using PostGIS
        ST_Distance(
            ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
            ST_GeogFromText('POINT(' || f.longitude || ' ' || f.latitude || ')')
        ) as distance
    FROM facility_facilities f
    WHERE 
        f.status = 'active' 
        AND f.is_active = true
        AND f.latitude IS NOT NULL 
        AND f.longitude IS NOT NULL
        AND ST_DWithin(
            ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
            ST_GeogFromText('POINT(' || f.longitude || ' ' || f.latitude || ')'),
            radius_meters
        )
    ORDER BY distance ASC;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO public;

-- Test the function with Kansas City coordinates
SELECT 
    name, 
    city, 
    state, 
    ROUND(distance::numeric, 2) as distance_meters
FROM get_facilities_within_radius(39.0997, -94.5786, 100000) 
LIMIT 5;