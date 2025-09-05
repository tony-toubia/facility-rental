-- Debug PostGIS function
-- Check facilities near Fairway, KS (39.01840527402992, -94.63570913935384)

-- First, let's see what facilities have coordinates
SELECT 
    id,
    name,
    city,
    state,
    latitude,
    longitude,
    status,
    is_active
FROM public.facility_facilities
WHERE latitude IS NOT NULL 
AND longitude IS NOT NULL
AND city IN ('Fairway', 'Overland Park', 'Kansas City')
ORDER BY city, name;

-- Test the PostGIS function directly
SELECT * FROM get_facilities_within_radius(
    39.01840527402992,  -- center_lat (Fairway, KS)
    -94.63570913935384, -- center_lng (Fairway, KS)
    40233.6             -- 25 miles in meters
);

-- Check if any facilities are within a larger radius (100 miles)
SELECT * FROM get_facilities_within_radius(
    39.01840527402992,  -- center_lat (Fairway, KS)
    -94.63570913935384, -- center_lng (Fairway, KS)
    160934.4            -- 100 miles in meters
);

-- Manual distance calculation for nearby facilities
SELECT 
    f.id,
    f.name,
    f.city,
    f.state,
    f.latitude,
    f.longitude,
    f.status,
    f.is_active,
    ST_Distance(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude::double precision, f.latitude::double precision), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(-94.63570913935384, 39.01840527402992), 4326), 3857)
    ) / 1609.34 as distance_miles
FROM facility_facilities f
WHERE f.status = 'approved'
AND f.is_active = true
AND f.latitude IS NOT NULL 
AND f.longitude IS NOT NULL
AND f.city IN ('Fairway', 'Overland Park', 'Kansas City')
ORDER BY distance_miles
LIMIT 10;