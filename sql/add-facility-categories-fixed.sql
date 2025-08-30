-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS facility_category_assignments;
DROP TABLE IF EXISTS facility_categories;

-- Create facility_categories table
CREATE TABLE facility_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    parent_category VARCHAR(50),
    search_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for facility-category relationships
CREATE TABLE facility_category_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facility_facilities(id) ON DELETE CASCADE,
    category_id VARCHAR(50) NOT NULL REFERENCES facility_categories(category_id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE, -- One category can be marked as primary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, category_id)
);

-- Insert the facility categories
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

-- Enable RLS on new tables
ALTER TABLE facility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_category_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for facility_categories (read-only for all users)
CREATE POLICY "Enable read access for all users" ON facility_categories
    FOR SELECT USING (true);

-- Create policies for facility_category_assignments
CREATE POLICY "Enable read access for all users" ON facility_category_assignments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON facility_category_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on facility owner" ON facility_category_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE facility_facilities.id = facility_category_assignments.facility_id 
            AND facility_facilities.owner_id = auth.uid()
        )
    );

CREATE POLICY "Enable delete for users based on facility owner" ON facility_category_assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM facility_facilities 
            WHERE facility_facilities.id = facility_category_assignments.facility_id 
            AND facility_facilities.owner_id = auth.uid()
        )
    );

-- Update the existing facilities with some example categories
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

-- Update the PostGIS function to include categories
CREATE OR REPLACE FUNCTION get_facilities_within_radius_with_categories(
    center_lat DOUBLE PRECISION,
    center_lng DOUBLE PRECISION,
    radius_miles DOUBLE PRECISION DEFAULT 25,
    category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    facility_id UUID,
    facility_name TEXT,
    facility_type TEXT,
    facility_description TEXT,
    facility_address TEXT,
    facility_city TEXT,
    facility_state TEXT,
    facility_latitude DOUBLE PRECISION,
    facility_longitude DOUBLE PRECISION,
    facility_price DECIMAL,
    facility_price_unit TEXT,
    facility_capacity INTEGER,
    facility_rating DECIMAL,
    facility_review_count INTEGER,
    facility_status TEXT,
    facility_created_at TIMESTAMP WITH TIME ZONE,
    facility_owner_id UUID,
    distance_miles DOUBLE PRECISION,
    categories TEXT[],
    primary_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.type,
        f.description,
        f.address,
        f.city,
        f.state,
        f.latitude,
        f.longitude,
        f.price,
        f.price_unit,
        f.capacity,
        f.rating,
        f.review_count,
        f.status,
        f.created_at,
        f.owner_id,
        ST_Distance(
            ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326), 3857),
            ST_Transform(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326), 3857)
        ) / 1609.34 as distance_miles,
        ARRAY(
            SELECT fc.name 
            FROM facility_category_assignments fca 
            JOIN facility_categories fc ON fca.category_id = fc.category_id 
            WHERE fca.facility_id = f.id
            ORDER BY fca.is_primary DESC, fc.name
        ) as categories,
        (
            SELECT fc.name 
            FROM facility_category_assignments fca 
            JOIN facility_categories fc ON fca.category_id = fc.category_id 
            WHERE fca.facility_id = f.id AND fca.is_primary = true
            LIMIT 1
        ) as primary_category
    FROM facility_facilities f
    WHERE f.status = 'active'
    AND f.latitude IS NOT NULL 
    AND f.longitude IS NOT NULL
    AND ST_DWithin(
        ST_Transform(ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326), 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326), 3857),
        radius_miles * 1609.34
    )
    AND (
        category_filter IS NULL 
        OR EXISTS (
            SELECT 1 FROM facility_category_assignments fca 
            WHERE fca.facility_id = f.id 
            AND fca.category_id = category_filter
        )
    )
    ORDER BY distance_miles;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_facilities_within_radius_with_categories(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_facilities_within_radius_with_categories(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, TEXT) TO authenticated;