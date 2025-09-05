-- Remove the unique constraint on facility_id to allow multiple reviews per facility
-- This is needed for the advanced review system that tracks review history

-- First, let's check if the constraint exists and what it's called
-- The constraint might be named differently in different environments

-- Drop the unique constraint (try different possible names)
DO $$ 
BEGIN
    -- Try to drop the constraint with the most common names
    BEGIN
        ALTER TABLE facility_reviews DROP CONSTRAINT IF EXISTS facility_reviews_facility_id_key;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if constraint doesn't exist
    END;
    
    BEGIN
        ALTER TABLE facility_reviews DROP CONSTRAINT IF EXISTS facility_reviews_facility_id_unique;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if constraint doesn't exist
    END;
    
    BEGIN
        ALTER TABLE facility_reviews DROP CONSTRAINT IF EXISTS facility_reviews_facility_id_idx;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore if constraint doesn't exist
    END;
END $$;

-- Create a regular index instead of unique constraint for performance
-- This allows multiple reviews per facility while maintaining query performance
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_id ON facility_reviews(facility_id);

-- Create an index on the new previous_review_id column for performance
CREATE INDEX IF NOT EXISTS idx_facility_reviews_previous_review_id ON facility_reviews(previous_review_id);

-- Create a composite index for finding the latest review per facility
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_updated ON facility_reviews(facility_id, updated_at DESC);

-- Verify the constraint is gone by trying to insert a test record (will be rolled back)
DO $$
DECLARE
    test_facility_id UUID;
BEGIN
    -- Get a facility ID that already has a review (if any exist)
    SELECT facility_id INTO test_facility_id 
    FROM facility_reviews 
    LIMIT 1;
    
    IF test_facility_id IS NOT NULL THEN
        -- Try to insert a duplicate - this should work now
        BEGIN
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
                general_comments
            ) VALUES (
                test_facility_id,
                'pending',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                'pending',
                '',
                ''
            );
            
            -- If we get here, the constraint is gone - clean up the test record
            DELETE FROM facility_reviews 
            WHERE facility_id = test_facility_id 
            AND status = 'pending' 
            AND basic_info_comments = ''
            AND created_at > NOW() - INTERVAL '1 minute';
            
            RAISE NOTICE 'SUCCESS: Unique constraint removed successfully. Multiple reviews per facility are now allowed.';
            
        EXCEPTION WHEN unique_violation THEN
            RAISE EXCEPTION 'FAILED: Unique constraint still exists. Manual intervention required.';
        END;
    ELSE
        RAISE NOTICE 'No existing reviews found to test with, but constraint removal commands executed.';
    END IF;
END $$;