-- Update the review system to work with the new visibility control
-- This ensures the review trigger works with is_active column

-- Update the review trigger to handle is_active properly
CREATE OR REPLACE FUNCTION update_facility_status_on_review()
RETURNS TRIGGER AS $$
BEGIN
    -- If review is approved, set facility to approved and make it active
    IF NEW.status = 'approved' THEN
        UPDATE public.facility_facilities 
        SET 
          status = 'approved'::facility_status,
          is_active = true,
          updated_at = NOW()
        WHERE id = NEW.facility_id;
    -- If review needs changes, set facility to needs_changes and make it inactive
    ELSIF NEW.status = 'needs_changes' THEN
        UPDATE public.facility_facilities 
        SET 
          status = 'needs_changes'::facility_status,
          is_active = false,
          updated_at = NOW()
        WHERE id = NEW.facility_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update RLS policies for facility_reviews to work with the new helper function
DROP POLICY IF EXISTS "Facility owners can view reviews of their facilities" ON public.facility_reviews;

CREATE POLICY "Facility owners can view reviews of their facilities" ON public.facility_reviews
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = get_current_facility_user_id()
        )
    );

-- Update the admin policy to be more specific
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON public.facility_reviews;

-- For now, allow all authenticated users to manage reviews (we'll add proper admin role later)
CREATE POLICY "Authenticated users can manage all reviews" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add a function to check if a facility needs resubmission after changes
CREATE OR REPLACE FUNCTION facility_needs_resubmission(facility_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.facility_facilities 
        WHERE id = facility_id_param 
        AND status = 'needs_changes'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to resubmit a facility for review
CREATE OR REPLACE FUNCTION resubmit_facility_for_review(facility_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the user owns this facility
    IF NOT EXISTS (
        SELECT 1 FROM public.facility_facilities 
        WHERE id = facility_id_param 
        AND owner_id = get_current_facility_user_id()
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Update facility status to pending_approval
    UPDATE public.facility_facilities 
    SET 
        status = 'pending_approval'::facility_status,
        updated_at = NOW()
    WHERE id = facility_id_param;
    
    -- Update any existing review to pending status
    UPDATE public.facility_reviews 
    SET 
        status = 'pending',
        updated_at = NOW()
    WHERE facility_id = facility_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION facility_needs_resubmission(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION resubmit_facility_for_review(UUID) TO authenticated;