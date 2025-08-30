-- Step 4: Add final categories
INSERT INTO facility_categories (category_id, name, description, icon, parent_category, search_keywords) VALUES
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
('golf', 'Golf Course/Range', 'Golf courses and driving ranges', '⛳', 'specialized', ARRAY['golf', 'course', 'driving range', 'putting'])
ON CONFLICT (category_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    parent_category = EXCLUDED.parent_category,
    search_keywords = EXCLUDED.search_keywords,
    updated_at = NOW();