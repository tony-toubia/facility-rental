-- Add availability review columns to facility_reviews table
-- Using TEXT type to match existing status columns

-- Add the availability columns to the facility_reviews table
ALTER TABLE public.facility_reviews 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS availability_comments TEXT DEFAULT '';

-- Add check constraints to ensure valid status values (optional but recommended)
ALTER TABLE public.facility_reviews 
ADD CONSTRAINT IF NOT EXISTS check_availability_status 
CHECK (availability_status IN ('pending', 'approved', 'needs_changes'));

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
AND column_name IN ('availability_status', 'availability_comments')
ORDER BY column_name;