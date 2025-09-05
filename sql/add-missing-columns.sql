-- Add missing columns to the existing facility_reviews table

-- Add all the missing review columns that the admin page expects
ALTER TABLE public.facility_reviews 
ADD COLUMN IF NOT EXISTS basic_info_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS basic_info_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS description_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS description_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS location_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS location_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS pricing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS pricing_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS amenities_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS amenities_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS features_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS features_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS images_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS images_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS policies_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS policies_comments TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS general_comments TEXT DEFAULT '';

-- Add status column if it doesn't exist
ALTER TABLE public.facility_reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add timestamps if they don't exist
ALTER TABLE public.facility_reviews 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have default values for new columns
UPDATE public.facility_reviews 
SET 
    basic_info_status = COALESCE(basic_info_status, 'pending'),
    basic_info_comments = COALESCE(basic_info_comments, ''),
    description_status = COALESCE(description_status, 'pending'),
    description_comments = COALESCE(description_comments, ''),
    location_status = COALESCE(location_status, 'pending'),
    location_comments = COALESCE(location_comments, ''),
    pricing_status = COALESCE(pricing_status, 'pending'),
    pricing_comments = COALESCE(pricing_comments, ''),
    amenities_status = COALESCE(amenities_status, 'pending'),
    amenities_comments = COALESCE(amenities_comments, ''),
    features_status = COALESCE(features_status, 'pending'),
    features_comments = COALESCE(features_comments, ''),
    images_status = COALESCE(images_status, 'pending'),
    images_comments = COALESCE(images_comments, ''),
    policies_status = COALESCE(policies_status, 'pending'),
    policies_comments = COALESCE(policies_comments, ''),
    general_comments = COALESCE(general_comments, ''),
    status = COALESCE(status, 'pending'),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW());

-- Force schema cache refresh
COMMENT ON TABLE public.facility_reviews IS 'Admin review data - columns added';
ANALYZE public.facility_reviews;