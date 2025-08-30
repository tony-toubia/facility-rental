-- Step 6: Create the PostGIS function with category support
CREATE OR REPLACE FUNCTION get_facilities_within_radius_with_categories(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_miles DOUBLE PRECISION DEFAULT 25,
    category_filter TEXT DEFAULT NULL
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
    facility_price DECIMAL,
    facility_price_unit TEXT,
    facility_capacity INTEGER,
    facility_rating DECIMAL,
    facility_review_count INTEGER,
    facility_status TEXT,
    facility_created_at TIMESTAMP WITH TIME ZONE,
    facility_owner_id UUID,
    distance_miles DOUBLE PRECISION,
    categories TEXT[],
    primary_category TEXT
) AS $$
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
        f.latitude,
        f.longitude,
        f.price,
        f.price_unit,
        f.capacity,
        f.rating,
        f.review_count,
        f.status,
        f.created_at,
        f.owner_id,
        ST_Distance(
            ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326), 3857),
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
        ) as primary_category
    FROM facility_facilities f
    WHERE f.status = 'active'
    AND f.latitude IS NOT NULL 
    AND f.longitude IS NOT NULL
    AND ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326), 3857),
        radius_miles * 1609.34
    )
    AND (
        category_filter IS NULL 
        OR EXISTS (
            SELECT 1 FROM facility_category_assignments fca 
            WHERE fca.facility_id = f.id 
            AND fca.category_id = category_filter
        )
    )
    ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_facilities_within_radius_with_categories(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius_with_categories(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO authenticated;