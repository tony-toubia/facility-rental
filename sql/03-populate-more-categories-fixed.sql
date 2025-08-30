-- Step 3: Add remaining categories (FIXED)
INSERT INTO facility_categories (id, category_id, name, description, icon, parent_category, search_keywords, created_at, updated_at) VALUES
-- Field Sports
(gen_random_uuid(), 'soccer', 'Soccer/Football', 'Soccer fields and futsal courts', '⚽', 'field-sports', ARRAY['soccer', 'football', 'futsal', 'field', 'pitch'], NOW(), NOW()),
(gen_random_uuid(), 'american-football', 'American Football', 'Football fields', '🏈', 'field-sports', ARRAY['football', 'field', 'gridiron'], NOW(), NOW()),
(gen_random_uuid(), 'baseball', 'Baseball', 'Baseball diamonds and fields', '⚾', 'field-sports', ARRAY['baseball', 'diamond', 'field', 'batting'], NOW(), NOW()),
(gen_random_uuid(), 'softball', 'Softball', 'Softball fields', '🥎', 'field-sports', ARRAY['softball', 'field', 'diamond'], NOW(), NOW()),
(gen_random_uuid(), 'lacrosse', 'Lacrosse', 'Lacrosse fields', '🥍', 'field-sports', ARRAY['lacrosse', 'field'], NOW(), NOW()),
(gen_random_uuid(), 'field-hockey', 'Field Hockey', 'Field hockey pitches', '🏑', 'field-sports', ARRAY['field hockey', 'hockey', 'pitch'], NOW(), NOW()),

-- Track & Field
(gen_random_uuid(), 'track', 'Track & Field', 'Running tracks and field event areas', '🏃', 'track-field', ARRAY['track', 'running', 'athletics', 'field events'], NOW(), NOW()),

-- Aquatic Sports
(gen_random_uuid(), 'swimming-pool', 'Swimming Pool', 'Swimming pools for laps, training, or recreation', '🏊', 'aquatic', ARRAY['swimming', 'pool', 'aquatic', 'water'], NOW(), NOW()),
(gen_random_uuid(), 'diving-pool', 'Diving Pool', 'Pools with diving boards or platforms', '🤿', 'aquatic', ARRAY['diving', 'pool', 'platform', 'board'], NOW(), NOW()),

-- Fitness & Training
(gen_random_uuid(), 'gym-fitness', 'Fitness Gym', 'Weight rooms and fitness centers', '💪', 'fitness', ARRAY['gym', 'fitness', 'weights', 'cardio', 'training'], NOW(), NOW()),
(gen_random_uuid(), 'dance-studio', 'Dance Studio', 'Dance and movement studios', '💃', 'fitness', ARRAY['dance', 'studio', 'movement', 'choreography'], NOW(), NOW()),
(gen_random_uuid(), 'martial-arts', 'Martial Arts', 'Martial arts dojos and training spaces', '🥋', 'fitness', ARRAY['martial arts', 'dojo', 'karate', 'judo', 'taekwondo'], NOW(), NOW()),
(gen_random_uuid(), 'yoga-studio', 'Yoga Studio', 'Yoga and meditation spaces', '🧘', 'fitness', ARRAY['yoga', 'meditation', 'studio', 'wellness'], NOW(), NOW())
ON CONFLICT (category_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    parent_category = EXCLUDED.parent_category,
    search_keywords = EXCLUDED.search_keywords,
    updated_at = NOW();