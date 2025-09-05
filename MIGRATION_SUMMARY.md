# Facility Listing Visibility Control Migration

## Overview
This migration separates **approval status** (controlled by admin review) from **listing visibility** (controlled by facility owners).

## Changes Made

### 1. Database Schema Changes
- **New field**: `is_active` (boolean) added to `facility_facilities` table
- **Migration**: All existing `status = 'active'` facilities → `status = 'approved', is_active = true`
- **Default**: New facilities start with `is_active = false`

### 2. Query Updates
**Before**: Facilities shown if `status IN ('active', 'approved')`
**After**: Facilities shown if `status = 'approved' AND is_active = true`

Updated files:
- `lib/database.ts` - getFacilities() and searchFacilities()
- `lib/geolocation.ts` - radius search
- `lib/geolocation-alternative.ts` - alternative radius search
- `app/browse/page.tsx` - browse page queries
- `app/api/test-admin/route.ts` - admin test queries

### 3. PostGIS Function Update
- Updated `get_facilities_within_radius()` function
- Now filters by `status = 'approved' AND is_active = true`
- Added `is_active` to return columns

### 4. Review System Updates
- Updated trigger `update_facility_status_on_review()`
- When approved: sets `status = 'approved', is_active = true`
- When needs changes: sets `status = 'needs_changes', is_active = false`

### 5. TypeScript Types
- Added `is_active: boolean` to Facility interface
- Updated Supabase type definitions

### 6. Dashboard Controls
- Added visibility toggle button in `FacilityReviewStatus.tsx`
- Only shows for approved facilities
- Toggle between "Visible" (eye icon) and "Hidden" (eye-off icon)
- Updates facility visibility in real-time

### 7. New Database Function
- `toggleFacilityVisibility(facilityId, isActive)` in `lib/database.ts`
- Allows facility owners to control their listing visibility

### 8. UI Updates
- Updated status display logic in components
- "Available" only shows for `status = 'approved' AND is_active = true`
- Dynamic success messages based on visibility status

## Migration Steps

### Step 1: Run SQL Migration
Execute the SQL script: `sql/add-listing-visibility-control.sql`

This will:
1. Add `is_active` column
2. Migrate existing data
3. Update the PostGIS function
4. Update the review trigger
5. Add RLS policy for owners

### Step 2: Verify Migration
1. Check that existing active facilities are now `approved` and `is_active = true`
2. Test the PostGIS function returns correct results
3. Verify dashboard toggle works for facility owners

## New Workflow

### For New Facilities:
1. **Created**: `status = 'pending_approval', is_active = false`
2. **Under Review**: `status = 'pending_review', is_active = false`
3. **Approved**: `status = 'approved', is_active = true` (auto-activated)
4. **Owner Control**: Can toggle `is_active` true/false anytime

### For Existing Facilities:
1. **Previously Active**: Now `status = 'approved', is_active = true`
2. **Owner Control**: Can toggle visibility on dashboard

## Benefits
1. **Clear Separation**: Approval vs. visibility are separate concerns
2. **Owner Control**: Facility owners can hide/show approved listings
3. **Admin Control**: Admins still control approval process
4. **Backward Compatible**: Existing functionality preserved
5. **Better UX**: Clear dashboard controls for owners

## Files Modified
- `sql/add-listing-visibility-control.sql` (new)
- `types/index.ts`
- `lib/supabase.ts`
- `lib/database.ts`
- `lib/geolocation.ts`
- `lib/geolocation-alternative.ts`
- `app/browse/page.tsx`
- `app/api/test-admin/route.ts`
- `components/FacilityReviewStatus.tsx`
- `components/FeaturedFacilities.tsx`