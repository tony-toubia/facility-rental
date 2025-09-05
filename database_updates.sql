-- Add column to track previous review for reference
ALTER TABLE facility_reviews 
ADD COLUMN previous_review_id UUID REFERENCES facility_reviews(id);

-- Add columns to track if feedback has been addressed
ALTER TABLE facility_reviews 
ADD COLUMN basic_info_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN description_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN location_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN pricing_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN amenities_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN features_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN images_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN policies_addressed BOOLEAN DEFAULT FALSE,
ADD COLUMN availability_addressed BOOLEAN DEFAULT FALSE;

-- Update the resubmit function to create new review with previous reference
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
            previous_review_id
        ) VALUES (
            facility_id_param,
            'pending',
            'pending',
            CASE WHEN current_review.basic_info_status = 'needs_changes' THEN current_review.basic_info_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.description_status = 'needs_changes' THEN current_review.description_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.location_status = 'needs_changes' THEN current_review.location_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.pricing_status = 'needs_changes' THEN current_review.pricing_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.amenities_status = 'needs_changes' THEN current_review.amenities_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.features_status = 'needs_changes' THEN current_review.features_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.images_status = 'needs_changes' THEN current_review.images_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.policies_status = 'needs_changes' THEN current_review.policies_comments ELSE '' END,
            'pending',
            CASE WHEN current_review.availability_status = 'needs_changes' THEN current_review.availability_comments ELSE '' END,
            current_review.general_comments,
            current_review.id
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;