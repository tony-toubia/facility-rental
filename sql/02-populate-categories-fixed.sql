-- Step 2: Safely populate categories (FIXED - explicit ID generation)
INSERT INTO facility_categories (id, category_id, name, description, icon, parent_category, search_keywords, created_at, updated_at) VALUES
-- Court Sports
(gen_random_uuid(), 'basketball', 'Basketball', 'Indoor and outdoor basketball courts', '🏀', 'court-sports', ARRAY['basketball', 'court', 'hoop', 'gym'], NOW(), NOW()),
(gen_random_uuid(), 'volleyball-indoor', 'Indoor Volleyball', 'Indoor volleyball courts with nets', '🏐', 'court-sports', ARRAY['volleyball', 'indoor', 'court', 'net', 'gym'], NOW(), NOW()),
(gen_random_uuid(), 'volleyball-outdoor', 'Outdoor Volleyball', 'Beach or outdoor volleyball courts', '🏖️', 'court-sports', ARRAY['volleyball', 'outdoor', 'beach', 'sand', 'court'], NOW(), NOW()),
(gen_random_uuid(), 'tennis', 'Tennis', 'Tennis courts indoor or outdoor', '🎾', 'court-sports', ARRAY['tennis', 'court', 'racquet', 'net'], NOW(), NOW()),
(gen_random_uuid(), 'pickleball', 'Pickleball', 'Pickleball courts', '🏓', 'court-sports', ARRAY['pickleball', 'paddle', 'court'], NOW(), NOW()),
(gen_random_uuid(), 'badminton', 'Badminton', 'Badminton courts', '🏸', 'court-sports', ARRAY['badminton', 'shuttlecock', 'court', 'racquet'], NOW(), NOW()),
(gen_random_uuid(), 'squash', 'Squash', 'Squash courts', '🎾', 'court-sports', ARRAY['squash', 'court', 'racquetball'], NOW(), NOW())
ON CONFLICT (category_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    parent_category = EXCLUDED.parent_category,
    search_keywords = EXCLUDED.search_keywords,
    updated_at = NOW();