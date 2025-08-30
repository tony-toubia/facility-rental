-- Add test coordinates to one facility (Fairway, KS coordinates)
UPDATE facility_facilities 
SET 
  latitude = 39.0267,
  longitude = -94.6275
WHERE name = 'Highlands Elementary Gym';

-- Test the PostGIS function with Fairway, KS area (should find the facility within 5 miles)
SELECT * FROM get_facilities_within_radius(39.0267, -94.6275, 5);

-- Test with a wider radius (should find the facility within 25 miles)
SELECT * FROM get_facilities_within_radius(39.0458, -76.6413, 25);

-- Check updated facility
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
WHERE name = 'Highlands Elementary Gym';