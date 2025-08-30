-- Step 3: Insert categories (Part 2 - Other Sports)
INSERT INTO facility_categories (category_id, name, description, icon, parent_category, search_keywords) VALUES
-- Track & Field
('track', 'Track & Field', 'Running tracks and field event areas', '🏃', 'track-field', ARRAY['track', 'running', 'athletics', 'field events']),

-- Aquatic Sports
('swimming-pool', 'Swimming Pool', 'Swimming pools for laps, training, or recreation', '🏊', 'aquatic', ARRAY['swimming', 'pool', 'aquatic', 'water']),
('diving-pool', 'Diving Pool', 'Pools with diving boards or platforms', '🤿', 'aquatic', ARRAY['diving', 'pool', 'platform', 'board']),

-- Fitness & Training
('gym-fitness', 'Fitness Gym', 'Weight rooms and fitness centers', '💪', 'fitness', ARRAY['gym', 'fitness', 'weights', 'cardio', 'training']),
('dance-studio', 'Dance Studio', 'Dance and movement studios', '💃', 'fitness', ARRAY['dance', 'studio', 'movement', 'choreography']),
('martial-arts', 'Martial Arts', 'Martial arts dojos and training spaces', '🥋', 'fitness', ARRAY['martial arts', 'dojo', 'karate', 'judo', 'taekwondo']),
('yoga-studio', 'Yoga Studio', 'Yoga and meditation spaces', '🧘', 'fitness', ARRAY['yoga', 'meditation', 'studio', 'wellness']),

-- Multi-Purpose
('gymnasium', 'Multi-Purpose Gymnasium', 'Large gym spaces that can accommodate multiple sports', '🏟️', 'multi-purpose', ARRAY['gymnasium', 'gym', 'multi-purpose', 'sports hall']),
('community-center', 'Community Center', 'Community centers with various activity spaces', '🏢', 'multi-purpose', ARRAY['community center', 'recreation center', 'multi-use']),
('event-hall', 'Event Hall', 'Large halls for events, tournaments, or gatherings', '🎪', 'multi-purpose', ARRAY['event hall', 'banquet', 'conference', 'meeting']),

-- Outdoor Recreation
('park-field', 'Park Field', 'Open park fields for various activities', '🌳', 'outdoor', ARRAY['park', 'field', 'outdoor', 'recreation']),
('playground', 'Playground', 'Playgrounds and play areas', '🛝', 'outdoor', ARRAY['playground', 'play area', 'children', 'kids']),

-- Specialized Sports
('ice-rink', 'Ice Rink', 'Ice skating and hockey rinks', '🏒', 'specialized', ARRAY['ice rink', 'hockey', 'skating', 'ice']),
('bowling', 'Bowling Alley', 'Bowling lanes', '🎳', 'specialized', ARRAY['bowling', 'lanes', 'alley']),
('golf', 'Golf Course/Range', 'Golf courses and driving ranges', '⛳', 'specialized', ARRAY['golf', 'course', 'driving range', 'putting']);