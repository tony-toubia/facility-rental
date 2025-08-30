-- Step 1: Create the category tables
-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS facility_category_assignments;
DROP TABLE IF EXISTS facility_categories;

-- Create facility_categories table
CREATE TABLE facility_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    parent_category VARCHAR(50),
    search_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for facility-category relationships
CREATE TABLE facility_category_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES facility_facilities(id) ON DELETE CASCADE,
    category_id VARCHAR(50) NOT NULL REFERENCES facility_categories(category_id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, category_id)
);