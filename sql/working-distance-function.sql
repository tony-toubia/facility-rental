-- Working distance function that handles custom types and SQL syntax correctly
-- This version avoids the enum type issues and GROUP BY problems

CREATE OR REPLACE FUNCTION get_facilities_within_radius(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_miles DOUBLE PRECISION DEFAULT 50
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
    latitude NUMERIC,
    longitude NUMERIC,
    price NUMERIC,
    price_unit TEXT,  -- Cast enum to TEXT
    capacity INTEGER,
    availability_increment INTEGER,
    minimum_rental_duration INTEGER,
    status TEXT,      -- Cast enum to TEXT
    is_active BOOLEAN,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    owner_id UUID,
    category_id UUID,
    rating NUMERIC,
    review_count INTEGER,
    distance_miles DOUBLE PRECISION
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
        f.price_unit::TEXT,  -- Cast enum to TEXT
        f.capacity,
        f.availability_increment,
        f.minimum_rental_duration,
        f.status::TEXT,      -- Cast enum to TEXT
        f.is_active,
        f.is_featured,
        f.created_at,
        f.updated_at,
        f.owner_id,
        f.category_id,
        f.rating,
        f.review_count,
        -- Calculate distance in miles using Haversine formula
        (
            3959 * acos(
                LEAST(1.0, 
                    cos(radians(user_lat)) * 
                    cos(radians(f.latitude::double precision)) * 
                    cos(radians(f.longitude::double precision) - radians(user_lng)) + 
                    sin(radians(user_lat)) * 
                    sin(radians(f.latitude::double precision))
                )
            )
        ) as distance_miles
    FROM facility_facilities f
    WHERE 
        f.status = 'active' 
        AND f.is_active = true
        AND f.latitude IS NOT NULL 
        AND f.longitude IS NOT NULL
        -- Filter by distance in WHERE clause instead of HAVING
        AND (
            3959 * acos(
                LEAST(1.0,
                    cos(radians(user_lat)) * 
                    cos(radians(f.latitude::double precision)) * 
                    cos(radians(f.longitude::double precision) - radians(user_lng)) + 
                    sin(radians(user_lat)) * 
                    sin(radians(f.latitude::double precision))
                )
            )
        ) <= radius_miles
    ORDER BY distance_miles ASC;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO public;

-- Test the function with Kansas City coordinates
SELECT 
    name, 
    city, 
    state, 
    price_unit,
    status,
    ROUND(distance_miles::numeric, 2) as distance_miles
FROM get_facilities_within_radius(39.0997, -94.5786, 100) 
LIMIT 5;