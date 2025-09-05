# 🔧 Database Updates Required

## ⚠️ **CRITICAL FIX NEEDED**

The error you're seeing:
```
❌ Error resubmitting facility: duplicate key value violates unique constraint "facility_reviews_facility_id_key"
```

This happens because the `facility_reviews` table has a unique constraint on `facility_id` that prevents multiple review records per facility. Our new advanced review system needs to create multiple reviews to track history.

## 🚀 **How to Fix**

### **Option 1: Run via Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database_updates_clean.sql`
4. Click **Run** to execute the updates

### **Option 2: Run via Command Line**
If you have direct database access:
```bash
psql -h your-db-host -U your-username -d your-database -f database_updates_clean.sql
```

### **Option 3: Run the Comprehensive Fix**
For extra safety, use `fix_unique_constraint.sql` which includes testing:
```sql
-- This file includes verification that the constraint was properly removed
```

## 📋 **What These Updates Do**

1. **Remove Unique Constraint**: Allows multiple review records per facility
2. **Add New Columns**: 
   - `previous_review_id` - Links reviews together
   - `*_addressed` fields - Tracks if feedback was addressed
3. **Create Indexes**: Maintains query performance
4. **Update RPC Function**: Handles resubmission logic properly

## ✅ **After Running Updates**

1. **Test Resubmission**: Try resubmitting a facility - should work now
2. **Check Admin Interface**: Previous feedback should show with checkboxes
3. **Verify Change Detection**: ChangeTracker should show modifications

## 🔍 **Verify Success**

After running the updates, you should be able to:
- ✅ Resubmit facilities without the duplicate key error
- ✅ See previous feedback with "Addressed" checkboxes
- ✅ View change detection for resubmissions
- ✅ Complete the full review cycle

## 🆘 **If You Still Get Errors**

1. Check if the constraint still exists:
   ```sql
   SELECT constraint_name 
   FROM information_schema.table_constraints 
   WHERE table_name = 'facility_reviews' 
   AND constraint_type = 'UNIQUE';
   ```

2. If constraints still exist, manually drop them:
   ```sql
   ALTER TABLE facility_reviews DROP CONSTRAINT constraint_name_here;
   ```

The system will work perfectly once these database updates are applied! 🎯