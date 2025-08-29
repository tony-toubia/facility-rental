-- Sample data for testing the facility rental platform
-- Run this after applying the main schema

-- Insert sample facility users
INSERT INTO public.facility_users (first_name, last_name, email, user_type, city, state, country) VALUES
('John', 'Smith', 'john.smith@example.com', 'owner', 'New York', 'NY', 'US'),
('Sarah', 'Johnson', 'sarah.johnson@example.com', 'owner', 'Los Angeles', 'CA', 'US'),
('Mike', 'Davis', 'mike.davis@example.com', 'owner', 'Chicago', 'IL', 'US'),
('Emily', 'Wilson', 'emily.wilson@example.com', 'renter', 'Miami', 'FL', 'US'),
('David', 'Brown', 'david.brown@example.com', 'renter', 'Seattle', 'WA', 'US');

-- Insert sample facilities
INSERT INTO public.facility_facilities (
    owner_id, category_id, name, type, description, address, city, state, zip_code, 
    price, price_unit, capacity, status, is_featured, rating, review_count
) VALUES
(
    (SELECT id FROM public.facility_users WHERE email = 'john.smith@example.com'),
    'gyms',
    'Elite Fitness Center',
    'Gym & Fitness',
    'State-of-the-art fitness center with modern equipment, personal training services, and group classes.',
    '123 Main Street',
    'New York',
    'NY',
    '10001',
    25.00,
    'hour',
    50,
    'active',
    true,
    4.8,
    124
),
(
    (SELECT id FROM public.facility_users WHERE email = 'sarah.johnson@example.com'),
    'pools',
    'Aqua Sports Complex',
    'Swimming Pool',
    'Olympic-size swimming pool with diving boards, heated water, and professional coaching available.',
    '456 Ocean Drive',
    'Los Angeles',
    'CA',
    '90210',
    40.00,
    'hour',
    30,
    'active',
    true,
    4.9,
    89
),
(
    (SELECT id FROM public.facility_users WHERE email = 'mike.davis@example.com'),
    'courts',
    'Championship Courts',
    'Basketball Court',
    'Professional basketball court with sound system, scoreboard, and locker rooms.',
    '789 Sports Avenue',
    'Chicago',
    'IL',
    '60601',
    35.00,
    'hour',
    20,
    'active',
    true,
    4.7,
    156
),
(
    (SELECT id FROM public.facility_users WHERE email = 'john.smith@example.com'),
    'studios',
    'Zen Yoga Studio',
    'Yoga Studio',
    'Peaceful yoga studio with natural lighting, props included, and experienced instructors.',
    '321 Wellness Way',
    'New York',
    'NY',
    '10002',
    20.00,
    'hour',
    25,
    'active',
    false,
    4.9,
    67
);

-- Insert sample facility images
INSERT INTO public.facility_images (facility_id, image_url, alt_text, is_primary, sort_order) VALUES
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'Elite Fitness Center main gym floor',
    true,
    1
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    'Aqua Sports Complex swimming pool',
    true,
    1
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
    'Championship Courts basketball court',
    true,
    1
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Zen Yoga Studio'),
    'https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=800&h=600&fit=crop',
    'Zen Yoga Studio peaceful interior',
    true,
    1
);

-- Insert sample amenities
INSERT INTO public.facility_amenities (facility_id, name, icon_name) VALUES
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'Locker Rooms',
    'Lock'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'Parking',
    'Car'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'Air Conditioning',
    'Wind'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    'Changing Rooms',
    'Users'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    'Towel Service',
    'Shirt'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    'Sound System',
    'Volume2'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    'Scoreboard',
    'Monitor'
);

-- Insert sample features
INSERT INTO public.facility_features (facility_id, name) VALUES
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'Full Equipment'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'Personal Training'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    'Group Classes'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    'Olympic Size'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    'Heated Pool'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    'Diving Board'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    'Professional Court'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    'Sound System'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    'Scoreboard'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Zen Yoga Studio'),
    'Peaceful Environment'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Zen Yoga Studio'),
    'Props Included'
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Zen Yoga Studio'),
    'Natural Light'
);

-- Insert sample reviews
INSERT INTO public.facility_reviews (facility_id, user_id, rating, comment, is_verified) VALUES
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Elite Fitness Center'),
    (SELECT id FROM public.facility_users WHERE email = 'emily.wilson@example.com'),
    5,
    'Amazing gym with top-notch equipment. The staff is very helpful and the facilities are always clean.',
    true
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Aqua Sports Complex'),
    (SELECT id FROM public.facility_users WHERE email = 'david.brown@example.com'),
    5,
    'Perfect pool for serious swimming. The water temperature is always just right.',
    true
),
(
    (SELECT id FROM public.facility_facilities WHERE name = 'Championship Courts'),
    (SELECT id FROM public.facility_users WHERE email = 'emily.wilson@example.com'),
    4,
    'Great court for basketball games. The sound system really adds to the experience.',
    true
);

-- Insert sample availability (Monday to Friday, 6 AM to 10 PM)
INSERT INTO public.facility_availability (facility_id, day_of_week, start_time, end_time, is_available) 
SELECT 
    f.id,
    dow,
    '06:00'::time,
    '22:00'::time,
    true
FROM public.facility_facilities f
CROSS JOIN generate_series(1, 5) as dow  -- Monday to Friday
WHERE f.status = 'active';

-- Insert weekend availability (Saturday and Sunday, 8 AM to 8 PM)
INSERT INTO public.facility_availability (facility_id, day_of_week, start_time, end_time, is_available) 
SELECT 
    f.id,
    dow,
    '08:00'::time,
    '20:00'::time,
    true
FROM public.facility_facilities f
CROSS JOIN generate_series(0, 0) as dow  -- Sunday
UNION ALL
SELECT 
    f.id,
    dow,
    '08:00'::time,
    '20:00'::time,
    true
FROM public.facility_facilities f
CROSS JOIN generate_series(6, 6) as dow  -- Saturday
WHERE f.status = 'active';