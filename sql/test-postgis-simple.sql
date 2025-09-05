-- Simple PostGIS test
-- Test the ST_DWithin function directly

SELECT 
    f.id,
    f.name,
    f.city,
    f.latitude,
    f.longitude,
    ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(-94.63570913935384, 39.01840527402992), 4326), 3857),
        40233.6  -- 25 miles in meters
    ) as within_radius,
    ST_Distance(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(-94.63570913935384, 39.01840527402992), 4326), 3857)
    ) as distance_meters,
    ST_Distance(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(-94.63570913935384, 39.01840527402992), 4326), 3857)
    ) / 1609.34 as distance_miles
FROM facility_facilities f
WHERE f.status = 'approved'
AND f.is_active = true
AND f.latitude IS NOT NULL 
AND f.longitude IS NOT NULL
AND f.city = 'Fairway'
ORDER BY distance_miles
LIMIT 5;