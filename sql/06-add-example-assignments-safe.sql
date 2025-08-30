-- Step 6: Add example category assignments to existing facilities
-- Highlands Elementary Gym - Basketball and Volleyball
INSERT INTO facility_category_assignments (facility_id, category_id, is_primary) 
SELECT id, 'basketball', true FROM facility_facilities WHERE name = 'Highlands Elementary Gym'
ON CONFLICT (facility_id, category_id) DO NOTHING;

INSERT INTO facility_category_assignments (facility_id, category_id, is_primary) 
SELECT id, 'volleyball-indoor', false FROM facility_facilities WHERE name = 'Highlands Elementary Gym'
ON CONFLICT (facility_id, category_id) DO NOTHING;

-- Chicken Gym - Multi-purpose gymnasium
INSERT INTO facility_category_assignments (facility_id, category_id, is_primary) 
SELECT id, 'gymnasium', true FROM facility_facilities WHERE name = 'Chicken Gym'
ON CONFLICT (facility_id, category_id) DO NOTHING;

INSERT INTO facility_category_assignments (facility_id, category_id, is_primary) 
SELECT id, 'basketball', false FROM facility_facilities WHERE name = 'Chicken Gym'
ON CONFLICT (facility_id, category_id) DO NOTHING;

INSERT INTO facility_category_assignments (facility_id, category_id, is_primary) 
SELECT id, 'volleyball-indoor', false FROM facility_facilities WHERE name = 'Chicken Gym'
ON CONFLICT (facility_id, category_id) DO NOTHING;