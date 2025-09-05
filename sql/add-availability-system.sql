-- Add availability/scheduling system to facilities
-- This supports flexible availability configuration with templates, custom schedules, and blocking

-- Step 1: Add availability configuration to facilities table
ALTER TABLE public.facility_facilities 
ADD COLUMN availability_increment INTEGER DEFAULT 30, -- minutes (30, 60, 120, etc.)
ADD COLUMN minimum_rental_duration INTEGER DEFAULT NULL, -- minutes, NULL means use increment as minimum
ADD COLUMN availability_timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN availability_notes TEXT DEFAULT NULL;

-- Step 2: Create availability templates table
CREATE TABLE public.facility_availability_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_system_template BOOLEAN DEFAULT false,
    template_data JSONB NOT NULL, -- stores the weekly pattern
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create facility default availability table (weekly recurring pattern)
CREATE TABLE public.facility_default_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_id, day_of_week, start_time, end_time)
);

-- Step 4: Create facility availability exceptions table (specific dates/times)
CREATE TABLE public.facility_availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME DEFAULT NULL, -- NULL means all day
    end_time TIME DEFAULT NULL, -- NULL means all day
    is_available BOOLEAN NOT NULL, -- false = blocked, true = available (override default)
    exception_type TEXT DEFAULT 'manual', -- 'manual', 'holiday', 'maintenance', 'recurring'
    recurring_pattern TEXT DEFAULT NULL, -- 'weekly', 'monthly', 'yearly' for recurring exceptions
    recurring_end_date DATE DEFAULT NULL, -- when recurring pattern ends
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create holiday templates table
CREATE TABLE public.facility_holiday_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    holiday_date DATE NOT NULL, -- for fixed dates like Christmas
    is_recurring BOOLEAN DEFAULT true, -- yearly recurring
    is_floating BOOLEAN DEFAULT false, -- for holidays like "first Monday in September"
    floating_rule TEXT DEFAULT NULL, -- JSON rule for floating holidays
    is_system_holiday BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Create facility selected holidays table
CREATE TABLE public.facility_selected_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facility_facilities(id) ON DELETE CASCADE,
    holiday_template_id UUID NOT NULL REFERENCES public.facility_holiday_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(facility_id, holiday_template_id)
);

-- Step 7: Insert common availability templates
INSERT INTO public.facility_availability_templates (name, description, is_system_template, template_data) VALUES
('Business Hours', 'Monday-Friday 9am-5pm', true, '{
    "pattern": [
        {"day": 1, "start": "09:00", "end": "17:00"},
        {"day": 2, "start": "09:00", "end": "17:00"},
        {"day": 3, "start": "09:00", "end": "17:00"},
        {"day": 4, "start": "09:00", "end": "17:00"},
        {"day": 5, "start": "09:00", "end": "17:00"}
    ]
}'),
('Extended Business Hours', 'Monday-Friday 8am-6pm', true, '{
    "pattern": [
        {"day": 1, "start": "08:00", "end": "18:00"},
        {"day": 2, "start": "08:00", "end": "18:00"},
        {"day": 3, "start": "08:00", "end": "18:00"},
        {"day": 4, "start": "08:00", "end": "18:00"},
        {"day": 5, "start": "08:00", "end": "18:00"}
    ]
}'),
('Weekends Only', 'Saturday-Sunday 10am-8pm', true, '{
    "pattern": [
        {"day": 0, "start": "10:00", "end": "20:00"},
        {"day": 6, "start": "10:00", "end": "20:00"}
    ]
}'),
('Full Week', 'Monday-Sunday 8am-10pm', true, '{
    "pattern": [
        {"day": 0, "start": "08:00", "end": "22:00"},
        {"day": 1, "start": "08:00", "end": "22:00"},
        {"day": 2, "start": "08:00", "end": "22:00"},
        {"day": 3, "start": "08:00", "end": "22:00"},
        {"day": 4, "start": "08:00", "end": "22:00"},
        {"day": 5, "start": "08:00", "end": "22:00"},
        {"day": 6, "start": "08:00", "end": "22:00"}
    ]
}'),
('School Hours', 'Monday-Friday 8am-3pm (typical school schedule)', true, '{
    "pattern": [
        {"day": 1, "start": "08:00", "end": "15:00"},
        {"day": 2, "start": "08:00", "end": "15:00"},
        {"day": 3, "start": "08:00", "end": "15:00"},
        {"day": 4, "start": "08:00", "end": "15:00"},
        {"day": 5, "start": "08:00", "end": "15:00"}
    ]
}'),
('After School & Weekends', 'Monday-Friday 3:30pm-9pm, Weekends 9am-9pm', true, '{
    "pattern": [
        {"day": 0, "start": "09:00", "end": "21:00"},
        {"day": 1, "start": "15:30", "end": "21:00"},
        {"day": 2, "start": "15:30", "end": "21:00"},
        {"day": 3, "start": "15:30", "end": "21:00"},
        {"day": 4, "start": "15:30", "end": "21:00"},
        {"day": 5, "start": "15:30", "end": "21:00"},
        {"day": 6, "start": "09:00", "end": "21:00"}
    ]
}');

-- Step 8: Insert common holidays
INSERT INTO public.facility_holiday_templates (name, description, holiday_date, is_recurring, is_system_holiday) VALUES
('New Year''s Day', 'January 1st', '2024-01-01', true, true),
('Martin Luther King Jr. Day', 'Third Monday in January', '2024-01-15', true, true),
('Presidents Day', 'Third Monday in February', '2024-02-19', true, true),
('Memorial Day', 'Last Monday in May', '2024-05-27', true, true),
('Independence Day', 'July 4th', '2024-07-04', true, true),
('Labor Day', 'First Monday in September', '2024-09-02', true, true),
('Columbus Day', 'Second Monday in October', '2024-10-14', true, true),
('Veterans Day', 'November 11th', '2024-11-11', true, true),
('Thanksgiving', 'Fourth Thursday in November', '2024-11-28', true, true),
('Christmas Day', 'December 25th', '2024-12-25', true, true),
('Christmas Eve', 'December 24th', '2024-12-24', true, true),
('New Year''s Eve', 'December 31st', '2024-12-31', true, true);

-- Step 9: Create indexes for performance
CREATE INDEX idx_facility_default_availability_facility_id ON public.facility_default_availability(facility_id);
CREATE INDEX idx_facility_default_availability_day_of_week ON public.facility_default_availability(day_of_week);
CREATE INDEX idx_facility_availability_exceptions_facility_id ON public.facility_availability_exceptions(facility_id);
CREATE INDEX idx_facility_availability_exceptions_date ON public.facility_availability_exceptions(exception_date);
CREATE INDEX idx_facility_selected_holidays_facility_id ON public.facility_selected_holidays(facility_id);

-- Step 10: Add RLS policies
ALTER TABLE public.facility_default_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_selected_holidays ENABLE ROW LEVEL SECURITY;

-- Allow facility owners to manage their availability
CREATE POLICY "Facility owners can manage their availability" ON public.facility_default_availability
    FOR ALL USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Facility owners can manage their availability exceptions" ON public.facility_availability_exceptions
    FOR ALL USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Facility owners can manage their holiday selections" ON public.facility_selected_holidays
    FOR ALL USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities WHERE owner_id = auth.uid()
        )
    );

-- Allow public read access to templates and holidays
ALTER TABLE public.facility_availability_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_holiday_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read availability templates" ON public.facility_availability_templates
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read holiday templates" ON public.facility_holiday_templates
    FOR SELECT USING (true);

-- Allow reading availability data for approved facilities
CREATE POLICY "Anyone can read availability for approved facilities" ON public.facility_default_availability
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

CREATE POLICY "Anyone can read availability exceptions for approved facilities" ON public.facility_availability_exceptions
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

CREATE POLICY "Anyone can read holiday selections for approved facilities" ON public.facility_selected_holidays
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE status = 'approved' AND is_active = true
        )
    );

-- Step 11: Create helper function to get facility availability for a date range
CREATE OR REPLACE FUNCTION get_facility_availability(
    p_facility_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_timezone TEXT DEFAULT 'America/New_York'
)
RETURNS TABLE (
    availability_date DATE,
    day_of_week INTEGER,
    time_slots JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date as check_date
    ),
    facility_config AS (
        SELECT 
            availability_increment,
            minimum_rental_duration,
            availability_timezone
        FROM facility_facilities 
        WHERE id = p_facility_id
    ),
    default_availability AS (
        SELECT 
            day_of_week,
            start_time,
            end_time,
            is_available
        FROM facility_default_availability 
        WHERE facility_id = p_facility_id
    ),
    exceptions AS (
        SELECT 
            exception_date,
            start_time,
            end_time,
            is_available,
            exception_type
        FROM facility_availability_exceptions 
        WHERE facility_id = p_facility_id
        AND exception_date BETWEEN p_start_date AND p_end_date
    )
    SELECT 
        ds.check_date,
        EXTRACT(DOW FROM ds.check_date)::INTEGER as day_of_week,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'start_time', da.start_time,
                    'end_time', da.end_time,
                    'is_available', CASE 
                        WHEN e.exception_date IS NOT NULL THEN e.is_available
                        ELSE da.is_available
                    END,
                    'exception_type', e.exception_type
                )
            ) FILTER (WHERE da.day_of_week IS NOT NULL),
            '[]'::jsonb
        ) as time_slots
    FROM date_series ds
    LEFT JOIN default_availability da ON da.day_of_week = EXTRACT(DOW FROM ds.check_date)
    LEFT JOIN exceptions e ON e.exception_date = ds.check_date 
        AND (
            (e.start_time IS NULL AND e.end_time IS NULL) OR
            (e.start_time <= da.start_time AND e.end_time >= da.end_time)
        )
    GROUP BY ds.check_date
    ORDER BY ds.check_date;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_facility_availability(UUID, DATE, DATE, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_facility_availability(UUID, DATE, DATE, TEXT) TO authenticated;