# 🔧 Fix for Missing Availability Columns

## Problem
The `facility_reviews` table is missing the `availability_status` and `availability_comments` columns that were added to the code but not to the database schema.

## Error Message
```
❌ Error approving facility: Could not find the 'availability_comments' column of 'facility_reviews' in the schema cache
```

## Solution

### Step 1: Add Missing Columns to Database

**Go to your Supabase Dashboard:**
1. Visit: https://supabase.com/dashboard/project/[your-project-id]/sql
2. Copy and paste this SQL:

```sql
-- Add availability review columns to facility_reviews table
ALTER TABLE public.facility_reviews 
ADD COLUMN IF NOT EXISTS availability_status review_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS availability_comments TEXT DEFAULT '';

-- Update the helper function to include availability in the needs_changes check
CREATE OR REPLACE FUNCTION facility_needs_resubmission(facility_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.facility_reviews 
        WHERE facility_reviews.facility_id = $1 
        AND (
            basic_info_status = 'needs_changes' OR
            description_status = 'needs_changes' OR
            location_status = 'needs_changes' OR
            pricing_status = 'needs_changes' OR
            amenities_status = 'needs_changes' OR
            features_status = 'needs_changes' OR
            images_status = 'needs_changes' OR
            policies_status = 'needs_changes' OR
            availability_status = 'needs_changes'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the resubmit function to include availability
CREATE OR REPLACE FUNCTION resubmit_facility_for_review(facility_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current user owns this facility
    IF NOT EXISTS (
        SELECT 1 FROM public.facility_facilities 
        WHERE id = $1 AND owner_id = get_current_facility_user_id()
    ) THEN
        RAISE EXCEPTION 'You can only resubmit your own facilities';
    END IF;
    
    -- Update facility status to pending_approval
    UPDATE public.facility_facilities 
    SET status = 'pending_approval', updated_at = NOW()
    WHERE id = $1;
    
    -- Reset review status to pending for sections that needed changes
    UPDATE public.facility_reviews 
    SET 
        basic_info_status = CASE WHEN basic_info_status = 'needs_changes' THEN 'pending' ELSE basic_info_status END,
        description_status = CASE WHEN description_status = 'needs_changes' THEN 'pending' ELSE description_status END,
        location_status = CASE WHEN location_status = 'needs_changes' THEN 'pending' ELSE location_status END,
        pricing_status = CASE WHEN pricing_status = 'needs_changes' THEN 'pending' ELSE pricing_status END,
        amenities_status = CASE WHEN amenities_status = 'needs_changes' THEN 'pending' ELSE amenities_status END,
        features_status = CASE WHEN features_status = 'needs_changes' THEN 'pending' ELSE features_status END,
        images_status = CASE WHEN images_status = 'needs_changes' THEN 'pending' ELSE images_status END,
        policies_status = CASE WHEN policies_status = 'needs_changes' THEN 'pending' ELSE policies_status END,
        availability_status = CASE WHEN availability_status = 'needs_changes' THEN 'pending' ELSE availability_status END,
        status = 'pending',
        updated_at = NOW()
    WHERE facility_reviews.facility_id = $1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. Click "Run" to execute the SQL

### Step 2: Verify the Fix

After running the SQL, the admin page should work properly with:
- ✅ Availability review section visible
- ✅ Approve button requiring all 9 sections (including availability) to be approved
- ✅ No more database errors when approving/rejecting facilities

### Step 3: Test the Complete Flow

1. Visit `/admin` page
2. Expand a facility for review
3. You should see 9 sections including "Availability & Schedule"
4. Set all sections to "Approved" to enable the Approve button
5. Set any section to "Needs Changes" with comments to enable Reject button

## What This Adds

The availability section will show:
- **Booking Settings**: Time increment, minimum duration, timezone
- **Weekly Schedule**: Available time slots for each day
- **Availability Notes**: Any special notes from facility owner

## Files Modified

- ✅ `app/admin/page.tsx` - Added availability section and logic
- ✅ `components/StatusIconSelector.tsx` - Removed extra blue ring
- ⚠️ Database schema - **NEEDS MANUAL UPDATE** (run SQL above)

## Current Status

- ✅ Code changes complete
- ⚠️ Database migration needed (run SQL above)
- 🎯 Ready to test after database update