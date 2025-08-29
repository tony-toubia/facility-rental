-- Setup Supabase Storage for facility images
-- Run this in your Supabase SQL Editor

-- Create the storage bucket for facility images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facility-images',
  'facility-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Allow public read access to facility images" ON storage.objects
  FOR SELECT USING (bucket_id = 'facility-images');

CREATE POLICY "Allow authenticated users to upload facility images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'facility-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to update their own facility images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'facility-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to delete their own facility images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'facility-images' 
    AND auth.role() = 'authenticated'
  );

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;