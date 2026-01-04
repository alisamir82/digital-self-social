-- =====================================================
-- Verify and Fix Storage Bucket Policies
-- Digital Self Social
-- =====================================================
--
-- Run this to check if your Storage policies are working
-- and fix any issues
-- =====================================================

-- First, let's check if the buckets exist
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name IN ('videos', 'thumbnails', 'avatars', 'banners');

-- Check existing policies
SELECT *
FROM storage.policies
WHERE bucket_id IN ('videos', 'thumbnails', 'avatars', 'banners')
ORDER BY bucket_id, name;

-- =====================================================
-- If policies exist but uploads still fail, DROP and RECREATE them
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

DROP POLICY IF EXISTS "Public read access for thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own thumbnails" ON storage.objects;

DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Public read access for banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own banners" ON storage.objects;

-- =====================================================
-- CREATE CORRECT POLICIES FOR VIDEOS BUCKET
-- =====================================================

CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- CREATE CORRECT POLICIES FOR THUMBNAILS BUCKET
-- =====================================================

CREATE POLICY "Public read access for thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- CREATE CORRECT POLICIES FOR AVATARS BUCKET
-- =====================================================

CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- CREATE CORRECT POLICIES FOR BANNERS BUCKET
-- =====================================================

CREATE POLICY "Public read access for banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'banners' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own banners"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFY POLICIES WERE CREATED
-- =====================================================

SELECT 
  bucket_id,
  name as policy_name,
  definition
FROM storage.policies
WHERE bucket_id IN ('videos', 'thumbnails', 'avatars', 'banners')
ORDER BY bucket_id, name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies have been recreated!';
  RAISE NOTICE '📝 All buckets now have proper RLS policies';
  RAISE NOTICE '🎥 You can now upload videos and thumbnails';
  RAISE NOTICE '📸 Avatar and banner uploads are also enabled';
END $$;
