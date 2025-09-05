# Missing facility_reviews Table - Fix Required! 🚨

## 🐛 **Current Issue**
```
❌ Error approving facility: Could not find the 'amenities_comments' column of 'facility_reviews' in the schema cache
```

## 🔍 **Root Cause**
The `facility_reviews` table **does not exist** in your current database schema. The admin page is trying to create/update review records in a table that doesn't exist.

## ✅ **Solution: Create Missing Table**

### **Option 1: Full Featured Table** (Recommended)
Run `sql/create-facility-reviews-table.sql` in your Supabase SQL editor.

**This creates:**
- ✅ Complete `facility_reviews` table with all required columns
- ✅ Proper data types and constraints
- ✅ RLS policies for security
- ✅ Helper functions for the review workflow
- ✅ Triggers for automatic timestamp updates

### **Option 2: Simple Table** (If Option 1 fails)
Run `sql/create-facility-reviews-simple.sql` in your Supabase SQL editor.

**This creates:**
- ✅ Basic `facility_reviews` table with all required columns
- ✅ Simple RLS policies
- ✅ Basic permissions

## 📋 **Required Columns**

The admin page expects these columns in `facility_reviews`:

### Status Columns:
- `basic_info_status` - Review status for basic facility info
- `description_status` - Review status for description
- `location_status` - Review status for location/address
- `pricing_status` - Review status for pricing
- `amenities_status` - Review status for amenities
- `features_status` - Review status for features
- `images_status` - Review status for images
- `policies_status` - Review status for policies

### Comment Columns:
- `basic_info_comments` - Admin feedback for basic info
- `description_comments` - Admin feedback for description
- `location_comments` - Admin feedback for location
- `pricing_comments` - Admin feedback for pricing
- `amenities_comments` - Admin feedback for amenities ⚠️ **This was missing!**
- `features_comments` - Admin feedback for features
- `images_comments` - Admin feedback for images
- `policies_comments` - Admin feedback for policies
- `general_comments` - General admin feedback

### System Columns:
- `id` - Primary key
- `facility_id` - Foreign key to facility_facilities
- `status` - Overall review status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## 🚀 **After Running the SQL Script**

1. **Test the Admin Page**: Go to `/admin` and try to review a facility
2. **Check Review Workflow**: 
   - Admin can provide feedback ✅
   - Facility owner sees feedback in dashboard ✅
   - Owner can resubmit for review ✅

## 🔧 **Troubleshooting**

### If you get permission errors:
```sql
-- Run this to fix permissions
GRANT ALL ON public.facility_reviews TO authenticated;
```

### If you get RLS policy errors:
```sql
-- Run this to create simple RLS policy
CREATE POLICY "Allow all for authenticated users" ON public.facility_reviews
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
```

### To check if table was created successfully:
```sql
-- Check if table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'facility_reviews' 
ORDER BY ordinal_position;
```

## 📁 **Files Created**

1. **`sql/create-facility-reviews-table.sql`** - Full featured table with functions
2. **`sql/create-facility-reviews-simple.sql`** - Simple table creation
3. **`sql/fix-admin-access.sql`** - RLS policies (run this after creating table)

## ⚡ **Quick Fix Steps**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** `sql/create-facility-reviews-table.sql`
3. **Click "Run"**
4. **Test admin page** at `/admin`
5. **If issues persist**, run `sql/create-facility-reviews-simple.sql` instead

The admin review system should work perfectly after creating this missing table! 🎉