-- =====================================================
-- Supabase Storage Bucket Policies
-- Digital Self Social - Video Sharing Platform
-- =====================================================
-- 
-- This script creates Row Level Security (RLS) policies for Storage buckets.
-- Run this in your Supabase SQL Editor after creating the buckets.
--
-- Required buckets:
-- 1. videos (for video files)
-- 2. thumbnails (for video thumbnails)
-- 3. avatars (for user profile pictures) - optional
-- 4. banners (for channel banners) - optional
--
-- =====================================================

-- =====================================================
-- VIDEOS BUCKET POLICIES
-- =====================================================

-- Policy 1: Allow public read access to all videos
-- This allows anyone to view/download videos
CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Policy 2: Allow authenticated users to upload videos to their own folder
-- Videos should be uploaded to: videos/{user_id}/{filename}
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- THUMBNAILS BUCKET POLICIES
-- =====================================================

-- Policy 1: Allow public read access to all thumbnails
CREATE POLICY "Public read access for thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Policy 2: Allow authenticated users to upload thumbnails to their own folder
-- Thumbnails should be uploaded to: thumbnails/{user_id}/{filename}
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their own thumbnails
CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own thumbnails
CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- AVATARS BUCKET POLICIES (Optional)
-- =====================================================
-- Uncomment if you created an 'avatars' bucket

/*
-- Policy 1: Allow public read access to all avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- =====================================================
-- BANNERS BUCKET POLICIES (Optional)
-- =====================================================
-- Uncomment if you created a 'banners' bucket for channel banners

/*
-- Policy 1: Allow public read access to all banners
CREATE POLICY "Public read access for banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Policy 2: Allow authenticated users to upload their channel banner
CREATE POLICY "Users can upload their channel banner"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their channel banner
CREATE POLICY "Users can update their channel banner"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'banners' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their channel banner
CREATE POLICY "Users can delete their channel banner"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
*/

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
-- Run these queries to verify your policies are created:

-- Check videos bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'videos';

-- Check thumbnails bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'thumbnails';

-- Check avatars bucket policies (if created)
-- SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- Check banners bucket policies (if created)
-- SELECT * FROM storage.policies WHERE bucket_id = 'banners';

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================
-- If you need to delete and recreate policies:
/*
-- Drop all policies for videos bucket
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Drop all policies for thumbnails bucket
DROP POLICY IF EXISTS "Public read access for thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own thumbnails" ON storage.objects;
*/

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- File Structure Convention:
-- - videos/{user_id}/{video_id}.mp4
-- - thumbnails/{user_id}/{video_id}.jpg
-- - avatars/{user_id}/avatar.jpg
-- - banners/{user_id}/banner.jpg
--
-- The policies ensure:
-- 1. Anyone can view/download files (public read)
-- 2. Only authenticated users can upload
-- 3. Users can only upload to their own folders
-- 4. Users can only modify/delete their own files
--
-- Make sure your buckets are set to PUBLIC in Storage settings!
-- =====================================================
