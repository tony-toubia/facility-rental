-- CRITICAL: Remove unique constraint on facility_id to allow multiple reviews per facility
-- This is required for the advanced review system that tracks review history
ALTER TABLE facility_reviews DROP CONSTRAINT IF EXISTS facility_reviews_facility_id_key;
ALTER TABLE facility_reviews DROP CONSTRAINT IF EXISTS facility_reviews_facility_id_unique;

-- Add column to track previous review for reference
ALTER TABLE facility_reviews 
ADD COLUMN IF NOT EXISTS previous_review_id UUID REFERENCES facility_reviews(id);

-- Create performance indexes (replacing the unique constraint)
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_id ON facility_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_previous_review_id ON facility_reviews(previous_review_id);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_updated ON facility_reviews(facility_id, updated_at DESC);

-- Add columns to track if feedback has been addressed
ALTER TABLE facility_reviews 
ADD COLUMN IF NOT EXISTS basic_info_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS description_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pricing_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS amenities_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS features_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS images_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policies_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS availability_addressed BOOLEAN DEFAULT FALSE;

-- Update the resubmit function to create new review with previous reference
-- IMPORTANT: Only reset sections that were previously rejected, preserve approved ones
CREATE OR REPLACE FUNCTION resubmit_facility_for_review(facility_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_review RECORD;
BEGIN
    -- Get the current review
    SELECT * INTO current_review 
    FROM facility_reviews 
    WHERE facility_id = facility_id_param 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    -- Update facility status to pending_approval
    UPDATE facility_facilities 
    SET status = 'pending_approval', updated_at = NOW()
    WHERE id = facility_id_param;
    
    -- Create new review record with previous review reference
    -- Only reset sections that were previously rejected (needs_changes)
    IF current_review.id IS NOT NULL THEN
        INSERT INTO facility_reviews (
            facility_id,
            status,
            basic_info_status,
            basic_info_comments,
            description_status,
            description_comments,
            location_status,
            location_comments,
            pricing_status,
            pricing_comments,
            amenities_status,
            amenities_comments,
            features_status,
            features_comments,
            images_status,
            images_comments,
            policies_status,
            policies_comments,
            availability_status,
            availability_comments,
            general_comments,
            previous_review_id,
            -- Initialize addressed flags
            basic_info_addressed,
            description_addressed,
            location_addressed,
            pricing_addressed,
            amenities_addressed,
            features_addressed,
            images_addressed,
            policies_addressed,
            availability_addressed
        ) VALUES (
            facility_id_param,
            'pending',
            -- Preserve approved status, reset rejected to pending
            CASE 
                WHEN current_review.basic_info_status = 'approved' THEN 'approved'
                WHEN current_review.basic_info_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.basic_info_status = 'needs_changes' THEN current_review.basic_info_comments ELSE '' END,
            CASE 
                WHEN current_review.description_status = 'approved' THEN 'approved'
                WHEN current_review.description_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.description_status = 'needs_changes' THEN current_review.description_comments ELSE '' END,
            CASE 
                WHEN current_review.location_status = 'approved' THEN 'approved'
                WHEN current_review.location_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.location_status = 'needs_changes' THEN current_review.location_comments ELSE '' END,
            CASE 
                WHEN current_review.pricing_status = 'approved' THEN 'approved'
                WHEN current_review.pricing_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.pricing_status = 'needs_changes' THEN current_review.pricing_comments ELSE '' END,
            CASE 
                WHEN current_review.amenities_status = 'approved' THEN 'approved'
                WHEN current_review.amenities_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.amenities_status = 'needs_changes' THEN current_review.amenities_comments ELSE '' END,
            CASE 
                WHEN current_review.features_status = 'approved' THEN 'approved'
                WHEN current_review.features_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.features_status = 'needs_changes' THEN current_review.features_comments ELSE '' END,
            CASE 
                WHEN current_review.images_status = 'approved' THEN 'approved'
                WHEN current_review.images_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.images_status = 'needs_changes' THEN current_review.images_comments ELSE '' END,
            CASE 
                WHEN current_review.policies_status = 'approved' THEN 'approved'
                WHEN current_review.policies_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.policies_status = 'needs_changes' THEN current_review.policies_comments ELSE '' END,
            CASE 
                WHEN current_review.availability_status = 'approved' THEN 'approved'
                WHEN current_review.availability_status = 'needs_changes' THEN 'pending' 
                ELSE 'pending' 
            END,
            CASE WHEN current_review.availability_status = 'needs_changes' THEN current_review.availability_comments ELSE '' END,
            current_review.general_comments,
            current_review.id,
            -- Initialize addressed flags to false
            FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;