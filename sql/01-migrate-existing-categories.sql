-- Step 1: Migrate existing category system to new structure
-- First, let's see what we're working with and migrate safely

-- Check if facility_categories already exists and what structure it has
DO $$
BEGIN
    -- Add missing columns to facility_categories if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'facility_categories' AND column_name = 'category_id') THEN
        ALTER TABLE facility_categories ADD COLUMN category_id VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'facility_categories' AND column_name = 'icon') THEN
        ALTER TABLE facility_categories ADD COLUMN icon VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'facility_categories' AND column_name = 'parent_category') THEN
        ALTER TABLE facility_categories ADD COLUMN parent_category VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'facility_categories' AND column_name = 'search_keywords') THEN
        ALTER TABLE facility_categories ADD COLUMN search_keywords TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'facility_categories' AND column_name = 'created_at') THEN
        ALTER TABLE facility_categories ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'facility_categories' AND column_name = 'updated_at') THEN
        ALTER TABLE facility_categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create facility_category_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS facility_category_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facility_facilities(id) ON DELETE CASCADE,
    category_id VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, category_id)
);

-- Clear existing data to start fresh (optional - comment out if you want to keep existing data)
DELETE FROM facility_categories;

-- Make category_id unique if it isn't already
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'facility_categories' 
                   AND constraint_type = 'UNIQUE' 
                   AND constraint_name LIKE '%category_id%') THEN
        ALTER TABLE facility_categories ADD CONSTRAINT facility_categories_category_id_unique UNIQUE (category_id);
    END IF;
END $$;