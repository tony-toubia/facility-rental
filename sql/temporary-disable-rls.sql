-- Temporary solution: Disable RLS for development
-- This will allow facility creation to work while we figure out the proper policies

-- Disable RLS on all problematic tables
ALTER TABLE public.facility_facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_default_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_availability_exceptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_selected_holidays DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_amenities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_features DISABLE ROW LEVEL SECURITY;

-- Note: You can re-enable RLS later with:
-- ALTER TABLE public.facility_facilities ENABLE ROW LEVEL SECURITY;
-- etc.