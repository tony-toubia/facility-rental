-- Add coordinates for all Fairway, KS facilities
-- Using slightly different coordinates for each to simulate different locations

-- Highlands Elementary Gym
UPDATE facility_facilities 
SET 
  latitude = 39.0267,
  longitude = -94.6275
WHERE name = 'Highlands Elementary Gym';

-- Chicken Gym  
UPDATE facility_facilities 
SET 
  latitude = 39.0280,
  longitude = -94.6290
WHERE name = 'Chicken Gym';

-- Chicken
UPDATE facility_facilities 
SET 
  latitude = 39.0250,
  longitude = -94.6260
WHERE name = 'Chicken';

-- this is new
UPDATE facility_facilities 
SET 
  latitude = 39.0290,
  longitude = -94.6300
WHERE name = 'this is new';

-- a new gym
UPDATE facility_facilities 
SET 
  latitude = 39.0240,
  longitude = -94.6250
WHERE name = 'a new gym';

-- Test the PostGIS function with Fairway, KS coordinates
SELECT * FROM get_facilities_within_radius(39.0267, -94.6275, 5);

-- Check all facilities now have coordinates
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