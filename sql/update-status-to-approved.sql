-- Update all 'active' status facilities to 'approved' status
-- This implements the proper approval workflow

-- First, let's see what we have
SELECT status, COUNT(*) as count 
FROM facility_facilities 
GROUP BY status;

-- Update all 'active' facilities to 'approved'
UPDATE facility_facilities 
SET status = 'approved' 
WHERE status = 'active';

-- Verify the update
SELECT status, COUNT(*) as count 
FROM facility_facilities 
GROUP BY status;