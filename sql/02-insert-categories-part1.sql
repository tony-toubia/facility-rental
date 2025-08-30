-- Step 2: Insert categories (Part 1 - Court Sports & Field Sports)
INSERT INTO facility_categories (category_id, name, description, icon, parent_category, search_keywords) VALUES
-- Court Sports
('basketball', 'Basketball', 'Indoor and outdoor basketball courts', '🏀', 'court-sports', ARRAY['basketball', 'court', 'hoop', 'gym']),
('volleyball-indoor', 'Indoor Volleyball', 'Indoor volleyball courts with nets', '🏐', 'court-sports', ARRAY['volleyball', 'indoor', 'court', 'net', 'gym']),
('volleyball-outdoor', 'Outdoor Volleyball', 'Beach or outdoor volleyball courts', '🏖️', 'court-sports', ARRAY['volleyball', 'outdoor', 'beach', 'sand', 'court']),
('tennis', 'Tennis', 'Tennis courts indoor or outdoor', '🎾', 'court-sports', ARRAY['tennis', 'court', 'racquet', 'net']),
('pickleball', 'Pickleball', 'Pickleball courts', '🏓', 'court-sports', ARRAY['pickleball', 'paddle', 'court']),
('badminton', 'Badminton', 'Badminton courts', '🏸', 'court-sports', ARRAY['badminton', 'shuttlecock', 'court', 'racquet']),
('squash', 'Squash', 'Squash courts', '🎾', 'court-sports', ARRAY['squash', 'court', 'racquetball']),

-- Field Sports
('soccer', 'Soccer/Football', 'Soccer fields and futsal courts', '⚽', 'field-sports', ARRAY['soccer', 'football', 'futsal', 'field', 'pitch']),
('american-football', 'American Football', 'Football fields', '🏈', 'field-sports', ARRAY['football', 'field', 'gridiron']),
('baseball', 'Baseball', 'Baseball diamonds and fields', '⚾', 'field-sports', ARRAY['baseball', 'diamond', 'field', 'batting']),
('softball', 'Softball', 'Softball fields', '🥎', 'field-sports', ARRAY['softball', 'field', 'diamond']),
('lacrosse', 'Lacrosse', 'Lacrosse fields', '🥍', 'field-sports', ARRAY['lacrosse', 'field']),
('field-hockey', 'Field Hockey', 'Field hockey pitches', '🏑', 'field-sports', ARRAY['field hockey', 'hockey', 'pitch']);