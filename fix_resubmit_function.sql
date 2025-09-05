-- Update the resubmit function to preserve approved statuses
-- Only reset sections that were previously rejected (needs_changes)
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
    -- IMPORTANT: Only reset sections that were previously rejected
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
            -- Only reset to pending if it was previously needs_changes, otherwise keep approved
            CASE WHEN current_review.basic_info_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.basic_info_status, 'pending') END,
            CASE WHEN current_review.basic_info_status = 'needs_changes' THEN current_review.basic_info_comments ELSE '' END,
            CASE WHEN current_review.description_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.description_status, 'pending') END,
            CASE WHEN current_review.description_status = 'needs_changes' THEN current_review.description_comments ELSE '' END,
            CASE WHEN current_review.location_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.location_status, 'pending') END,
            CASE WHEN current_review.location_status = 'needs_changes' THEN current_review.location_comments ELSE '' END,
            CASE WHEN current_review.pricing_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.pricing_status, 'pending') END,
            CASE WHEN current_review.pricing_status = 'needs_changes' THEN current_review.pricing_comments ELSE '' END,
            CASE WHEN current_review.amenities_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.amenities_status, 'pending') END,
            CASE WHEN current_review.amenities_status = 'needs_changes' THEN current_review.amenities_comments ELSE '' END,
            CASE WHEN current_review.features_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.features_status, 'pending') END,
            CASE WHEN current_review.features_status = 'needs_changes' THEN current_review.features_comments ELSE '' END,
            CASE WHEN current_review.images_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.images_status, 'pending') END,
            CASE WHEN current_review.images_status = 'needs_changes' THEN current_review.images_comments ELSE '' END,
            CASE WHEN current_review.policies_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.policies_status, 'pending') END,
            CASE WHEN current_review.policies_status = 'needs_changes' THEN current_review.policies_comments ELSE '' END,
            CASE WHEN current_review.availability_status = 'needs_changes' THEN 'pending' ELSE COALESCE(current_review.availability_status, 'pending') END,
            CASE WHEN current_review.availability_status = 'needs_changes' THEN current_review.availability_comments ELSE '' END,
            current_review.general_comments,
            current_review.id
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;