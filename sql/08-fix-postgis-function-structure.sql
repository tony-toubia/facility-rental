-- Step 8: Fix the PostGIS function to match the original structure
CREATE OR REPLACE FUNCTION get_facilities_within_radius_with_categories(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_miles DOUBLE PRECISION DEFAULT 25,
    category_filter TEXT DEFAULT NULL
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
    primary_category TEXT
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
        ) as primary_category
    FROM facility_facilities f
    WHERE f.status = 'active'
    AND f.latitude IS NOT NULL 
    AND f.longitude IS NOT NULL
    AND ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
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