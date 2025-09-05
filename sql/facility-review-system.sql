-- Extend facility_status enum to include review states
ALTER TYPE facility_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE facility_status ADD VALUE IF NOT EXISTS 'needs_changes';
ALTER TYPE facility_status ADD VALUE IF NOT EXISTS 'approved';

-- Create facility review table
CREATE TABLE IF NOT EXISTS public.facility_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID REFERENCES public.facility_facilities(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.facility_users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'needs_changes')),
    
    -- Section-by-section review fields
    basic_info_status TEXT CHECK (basic_info_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    basic_info_comments TEXT,
    
    description_status TEXT CHECK (description_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    description_comments TEXT,
    
    location_status TEXT CHECK (location_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    location_comments TEXT,
    
    pricing_status TEXT CHECK (pricing_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    pricing_comments TEXT,
    
    amenities_status TEXT CHECK (amenities_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    amenities_comments TEXT,
    
    features_status TEXT CHECK (features_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    features_comments TEXT,
    
    images_status TEXT CHECK (images_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    images_comments TEXT,
    
    policies_status TEXT CHECK (policies_status IN ('approved', 'needs_changes', 'pending')) DEFAULT 'pending',
    policies_comments TEXT,
    
    -- Overall review comments
    general_comments TEXT,
    internal_notes TEXT, -- For admin use only
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_id ON public.facility_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_reviewer_id ON public.facility_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_status ON public.facility_reviews(status);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_created_at ON public.facility_reviews(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION facility_update_reviews_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_facility_reviews_updated_at 
    BEFORE UPDATE ON public.facility_reviews 
    FOR EACH ROW EXECUTE FUNCTION facility_update_reviews_updated_at_column();

-- RLS Policies for facility_reviews
ALTER TABLE public.facility_reviews ENABLE ROW LEVEL SECURITY;

-- Allow facility owners to view reviews of their facilities
CREATE POLICY "Facility owners can view reviews of their facilities" ON public.facility_reviews
    FOR SELECT USING (
        facility_id IN (
            SELECT id FROM public.facility_facilities 
            WHERE owner_id = auth.uid()
        )
    );

-- Allow admins to manage all reviews (we'll implement admin role check later)
CREATE POLICY "Authenticated users can manage reviews" ON public.facility_reviews
    FOR ALL USING (auth.role() = 'authenticated');

-- Update facility status when review is completed
CREATE OR REPLACE FUNCTION update_facility_status_on_review()
RETURNS TRIGGER AS $$
BEGIN
    -- If review is approved, set facility to approved
    IF NEW.status = 'approved' THEN
        UPDATE public.facility_facilities 
        SET status = 'approved'::facility_status
        WHERE id = NEW.facility_id;
    -- If review needs changes, set facility to needs_changes
    ELSIF NEW.status = 'needs_changes' THEN
        UPDATE public.facility_facilities 
        SET status = 'needs_changes'::facility_status
        WHERE id = NEW.facility_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER facility_status_update_on_review
    AFTER UPDATE ON public.facility_reviews
    FOR EACH ROW EXECUTE FUNCTION update_facility_status_on_review();