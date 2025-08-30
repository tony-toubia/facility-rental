-- Step 4: Add final categories (FIXED)
INSERT INTO facility_categories (id, category_id, name, description, icon, parent_category, search_keywords, created_at, updated_at) VALUES
-- Multi-Purpose
(gen_random_uuid(), 'gymnasium', 'Multi-Purpose Gymnasium', 'Large gym spaces that can accommodate multiple sports', '🏟️', 'multi-purpose', ARRAY['gymnasium', 'gym', 'multi-purpose', 'sports hall'], NOW(), NOW()),
(gen_random_uuid(), 'community-center', 'Community Center', 'Community centers with various activity spaces', '🏢', 'multi-purpose', ARRAY['community center', 'recreation center', 'multi-use'], NOW(), NOW()),
(gen_random_uuid(), 'event-hall', 'Event Hall', 'Large halls for events, tournaments, or gatherings', '🎪', 'multi-purpose', ARRAY['event hall', 'banquet', 'conference', 'meeting'], NOW(), NOW()),

-- Outdoor Recreation
(gen_random_uuid(), 'park-field', 'Park Field', 'Open park fields for various activities', '🌳', 'outdoor', ARRAY['park', 'field', 'outdoor', 'recreation'], NOW(), NOW()),
(gen_random_uuid(), 'playground', 'Playground', 'Playgrounds and play areas', '🛝', 'outdoor', ARRAY['playground', 'play area', 'children', 'kids'], NOW(), NOW()),

-- Specialized Sports
(gen_random_uuid(), 'ice-rink', 'Ice Rink', 'Ice skating and hockey rinks', '🏒', 'specialized', ARRAY['ice rink', 'hockey', 'skating', 'ice'], NOW(), NOW()),
(gen_random_uuid(), 'bowling', 'Bowling Alley', 'Bowling lanes', '🎳', 'specialized', ARRAY['bowling', 'lanes', 'alley'], NOW(), NOW()),
(gen_random_uuid(), 'golf', 'Golf Course/Range', 'Golf courses and driving ranges', '⛳', 'specialized', ARRAY['golf', 'course', 'driving range', 'putting'], NOW(), NOW())
ON CONFLICT (category_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    parent_category = EXCLUDED.parent_category,
    search_keywords = EXCLUDED.search_keywords,
    updated_at = NOW();