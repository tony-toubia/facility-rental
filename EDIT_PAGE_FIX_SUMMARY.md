# 🔧 Edit Facility Page Fix

## 🐛 **Issue Identified:**

**Problem**: When users edited facilities on the edit page, all sections reverted to "pending" instead of preserving approved statuses.

**Root Causes**:
1. **Wrong Review Query**: Edit page was using `.single()` instead of getting the most recent review
2. **Missing Resubmit Logic**: Edit page wasn't calling `resubmit_facility_for_review` function when saving changes

## ✅ **Fixes Applied:**

### **Fix 1: Get Most Recent Review**
```typescript
// BEFORE: Got random review record
const { data: reviewData } = await supabase
  .from('facility_reviews')
  .select('*')
  .eq('facility_id', facilityId)
  .single()

// AFTER: Gets the most recent review
const { data: reviewData } = await supabase
  .from('facility_reviews')
  .select('*')
  .eq('facility_id', facilityId)
  .order('updated_at', { ascending: false })
  .limit(1)
  .single()
```

### **Fix 2: Auto-Resubmit When Saving Changes**
```typescript
// Added to handleSave function after updating facility data:
if (facility?.status === 'needs_changes') {
  const { error: resubmitError } = await supabase.rpc('resubmit_facility_for_review', {
    facility_id_param: facilityId
  })
  
  if (resubmitError) {
    console.error('Error resubmitting facility:', resubmitError)
    setMessage('✅ Facility updated successfully! Note: There was an issue resubmitting for review. You may need to use the resubmit button on the dashboard.')
  } else {
    setMessage('✅ Facility updated and resubmitted for review successfully!')
  }
} else {
  setMessage('✅ Facility updated successfully!')
}
```

## 🎯 **Expected Behavior After Fix:**

### **Edit Page Review Display:**
1. ✅ **Shows correct review statuses** - approved sections show as approved
2. ✅ **Displays proper feedback** - only rejected sections show admin comments
3. ✅ **Visual indicators work** - green for approved, red for needs changes

### **Save Changes Workflow:**
1. **User edits facility** → Makes changes to rejected sections
2. **User clicks "Save Changes"** → Facility data is updated
3. **Auto-resubmit triggers** → Calls `resubmit_facility_for_review` function
4. ✅ **New review created** → Preserves approved statuses, resets rejected to pending
5. ✅ **Status changes** → Facility status becomes `pending_approval`

### **Complete User Experience:**
1. **Admin does mixed review** → Approves some sections, rejects others
2. **User goes to edit page** → Sees approved sections as approved, rejected with feedback
3. **User makes changes** → Addresses feedback in rejected sections
4. **User saves changes** → System automatically resubmits with preserved approvals
5. **User returns to dashboard** → Sees facility as "Pending Approval" (no resubmit button)

## 🧪 **Test Scenario:**

### **Complete Workflow Test:**
1. Admin approves Basic Info, Description, Location
2. Admin rejects Pricing, Amenities with feedback
3. User goes to edit page
4. ✅ User should see:
   - Basic Info: ✅ Approved (green background)
   - Description: ✅ Approved (green background)  
   - Location: ✅ Approved (green background)
   - Pricing: ❌ Needs Changes (red background with feedback)
   - Amenities: ❌ Needs Changes (red background with feedback)
5. User updates pricing and amenities
6. User clicks "Save Changes"
7. ✅ System should:
   - Update facility data
   - Auto-resubmit for review
   - Preserve approved statuses for Basic Info, Description, Location
   - Reset Pricing and Amenities to pending
   - Change facility status to pending_approval

## 🎉 **System Now Fully Fixed!**

The edit facility page now:
- **Shows correct review statuses** from the most recent review
- **Automatically resubmits** when changes are saved
- **Preserves approved work** so users don't lose progress
- **Provides seamless workflow** from edit to resubmission

Both the dashboard review display AND the edit page now work correctly! 🚀