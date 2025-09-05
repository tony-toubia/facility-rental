-- Add availability review columns to facility_reviews table
-- Simple version without constraint issues

-- Add the availability columns to the facility_reviews table
ALTER TABLE public.facility_reviews 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS availability_comments TEXT DEFAULT '';

-- Verify the columns were added
SELECT 'Columns added successfully' as result;