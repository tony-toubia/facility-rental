-- Basic function to get facilities without complex distance calculations
-- This ensures we can at least get the browse page working

CREATE OR REPLACE FUNCTION get_all_facilities()
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
    review_count INTEGER
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
        f.status::TEXT,      -- Cast enum to TEXT
        f.is_active,
        f.is_featured,
        f.created_at,
        f.updated_at,
        f.owner_id,
        f.category_id,
        f.rating,
        f.review_count
    FROM facility_facilities f
    WHERE 
        f.status = 'active' 
        AND f.is_active = true
    ORDER BY f.created_at DESC;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION get_all_facilities() TO anon;
GRANT EXECUTE ON FUNCTION get_all_facilities() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_facilities() TO public;

-- Test the function
SELECT 
    name, 
    city, 
    state, 
    price_unit,
    status
FROM get_all_facilities() 
LIMIT 5;