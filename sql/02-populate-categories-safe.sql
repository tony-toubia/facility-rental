-- Step 2: Safely populate categories (will not duplicate)
INSERT INTO facility_categories (category_id, name, description, icon, parent_category, search_keywords) VALUES
-- Court Sports
('basketball', 'Basketball', 'Indoor and outdoor basketball courts', '🏀', 'court-sports', ARRAY['basketball', 'court', 'hoop', 'gym']),
('volleyball-indoor', 'Indoor Volleyball', 'Indoor volleyball courts with nets', '🏐', 'court-sports', ARRAY['volleyball', 'indoor', 'court', 'net', 'gym']),
('volleyball-outdoor', 'Outdoor Volleyball', 'Beach or outdoor volleyball courts', '🏖️', 'court-sports', ARRAY['volleyball', 'outdoor', 'beach', 'sand', 'court']),
('tennis', 'Tennis', 'Tennis courts indoor or outdoor', '🎾', 'court-sports', ARRAY['tennis', 'court', 'racquet', 'net']),
('pickleball', 'Pickleball', 'Pickleball courts', '🏓', 'court-sports', ARRAY['pickleball', 'paddle', 'court']),
('badminton', 'Badminton', 'Badminton courts', '🏸', 'court-sports', ARRAY['badminton', 'shuttlecock', 'court', 'racquet']),
('squash', 'Squash', 'Squash courts', '🎾', 'court-sports', ARRAY['squash', 'court', 'racquetball'])
ON CONFLICT (category_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    parent_category = EXCLUDED.parent_category,
    search_keywords = EXCLUDED.search_keywords,
    updated_at = NOW();