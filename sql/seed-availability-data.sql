-- Seed availability data for testing the booking system
-- This script adds sample availability data for existing facilities

-- First, let's add availability configuration to existing facilities
UPDATE public.facility_facilities 
SET 
    availability_increment = 60, -- 1 hour slots
    minimum_rental_duration = 60, -- minimum 1 hour
    availability_timezone = 'America/New_York',
    availability_notes = 'Standard business hours availability'
WHERE availability_increment IS NULL;

-- Add default availability for all facilities (Monday-Friday 9am-5pm)
INSERT INTO public.facility_default_availability (facility_id, day_of_week, start_time, end_time, is_available)
SELECT 
    f.id as facility_id,
    dow as day_of_week,
    '09:00'::time as start_time,
    '17:00'::time as end_time,
    true as is_available
FROM public.facility_facilities f
CROSS JOIN generate_series(1, 5) as dow -- Monday to Friday
ON CONFLICT (facility_id, day_of_week, start_time, end_time) DO NOTHING;

-- Add weekend availability for some facilities (Saturday-Sunday 10am-6pm)
INSERT INTO public.facility_default_availability (facility_id, day_of_week, start_time, end_time, is_available)
SELECT 
    f.id as facility_id,
    dow as day_of_week,
    '10:00'::time as start_time,
    '18:00'::time as end_time,
    true as is_available
FROM public.facility_facilities f
CROSS JOIN generate_series(0, 6, 6) as dow -- Saturday and Sunday (0=Sunday, 6=Saturday)
WHERE f.type IN ('Conference Room', 'Event Hall', 'Sports Complex')
ON CONFLICT (facility_id, day_of_week, start_time, end_time) DO NOTHING;

-- Add some extended hours for gyms and sports facilities
INSERT INTO public.facility_default_availability (facility_id, day_of_week, start_time, end_time, is_available)
SELECT 
    f.id as facility_id,
    dow as day_of_week,
    '06:00'::time as start_time,
    '22:00'::time as end_time,
    true as is_available
FROM public.facility_facilities f
CROSS JOIN generate_series(1, 5) as dow -- Monday to Friday
WHERE f.type IN ('Gym', 'Sports Complex', 'Swimming Pool')
ON CONFLICT (facility_id, day_of_week, start_time, end_time) DO NOTHING;

-- Add some availability exceptions (blocked dates for maintenance)
INSERT INTO public.facility_availability_exceptions (facility_id, exception_date, start_time, end_time, is_available, exception_type, notes)
SELECT 
    f.id as facility_id,
    CURRENT_DATE + INTERVAL '7 days' as exception_date,
    '09:00'::time as start_time,
    '12:00'::time as end_time,
    false as is_available,
    'maintenance' as exception_type,
    'Scheduled maintenance' as notes
FROM public.facility_facilities f
WHERE f.type = 'Conference Room'
LIMIT 2;

-- Add some holiday selections for facilities
INSERT INTO public.facility_selected_holidays (facility_id, holiday_template_id)
SELECT 
    f.id as facility_id,
    h.id as holiday_template_id
FROM public.facility_facilities f
CROSS JOIN public.facility_holiday_templates h
WHERE h.name IN ('Christmas Day', 'New Year''s Day', 'Thanksgiving')
ON CONFLICT (facility_id, holiday_template_id) DO NOTHING;

-- Verify the data
SELECT 
    f.name,
    f.type,
    f.availability_increment,
    f.minimum_rental_duration,
    COUNT(da.id) as default_availability_slots,
    COUNT(DISTINCT da.day_of_week) as available_days
FROM public.facility_facilities f
LEFT JOIN public.facility_default_availability da ON f.id = da.facility_id
GROUP BY f.id, f.name, f.type, f.availability_increment, f.minimum_rental_duration
ORDER BY f.name;