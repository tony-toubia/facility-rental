-- Step 3: Add remaining categories
INSERT INTO facility_categories (category_id, name, description, icon, parent_category, search_keywords) VALUES
-- Field Sports
('soccer', 'Soccer/Football', 'Soccer fields and futsal courts', '⚽', 'field-sports', ARRAY['soccer', 'football', 'futsal', 'field', 'pitch']),
('american-football', 'American Football', 'Football fields', '🏈', 'field-sports', ARRAY['football', 'field', 'gridiron']),
('baseball', 'Baseball', 'Baseball diamonds and fields', '⚾', 'field-sports', ARRAY['baseball', 'diamond', 'field', 'batting']),
('softball', 'Softball', 'Softball fields', '🥎', 'field-sports', ARRAY['softball', 'field', 'diamond']),
('lacrosse', 'Lacrosse', 'Lacrosse fields', '🥍', 'field-sports', ARRAY['lacrosse', 'field']),
('field-hockey', 'Field Hockey', 'Field hockey pitches', '🏑', 'field-sports', ARRAY['field hockey', 'hockey', 'pitch']),

-- Track & Field
('track', 'Track & Field', 'Running tracks and field event areas', '🏃', 'track-field', ARRAY['track', 'running', 'athletics', 'field events']),

-- Aquatic Sports
('swimming-pool', 'Swimming Pool', 'Swimming pools for laps, training, or recreation', '🏊', 'aquatic', ARRAY['swimming', 'pool', 'aquatic', 'water']),
('diving-pool', 'Diving Pool', 'Pools with diving boards or platforms', '🤿', 'aquatic', ARRAY['diving', 'pool', 'platform', 'board']),

-- Fitness & Training
('gym-fitness', 'Fitness Gym', 'Weight rooms and fitness centers', '💪', 'fitness', ARRAY['gym', 'fitness', 'weights', 'cardio', 'training']),
('dance-studio', 'Dance Studio', 'Dance and movement studios', '💃', 'fitness', ARRAY['dance', 'studio', 'movement', 'choreography']),
('martial-arts', 'Martial Arts', 'Martial arts dojos and training spaces', '🥋', 'fitness', ARRAY['martial arts', 'dojo', 'karate', 'judo', 'taekwondo']),
('yoga-studio', 'Yoga Studio', 'Yoga and meditation spaces', '🧘', 'fitness', ARRAY['yoga', 'meditation', 'studio', 'wellness'])
ON CONFLICT (category_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    parent_category = EXCLUDED.parent_category,
    search_keywords = EXCLUDED.search_keywords,
    updated_at = NOW();