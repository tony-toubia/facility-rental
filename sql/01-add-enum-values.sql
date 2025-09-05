-- Part 1: Add enum values (must be run separately and committed)
-- This separates approval status from listing visibility

-- Add missing enum values to facility_status
ALTER TYPE facility_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE facility_status ADD VALUE IF NOT EXISTS 'needs_changes';
ALTER TYPE facility_status ADD VALUE IF NOT EXISTS 'approved';

-- Note: After running this script, you must commit the transaction
-- before running the next part of the migration.