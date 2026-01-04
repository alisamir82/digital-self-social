-- =====================================================
-- RESET ALL STORAGE POLICIES
-- Digital Self Social - Complete Policy Reset
-- =====================================================
-- This script will:
-- 1. Delete ALL existing policies on storage.objects
-- 2. Create fresh policies for all buckets
-- 3. Ensure authenticated users can upload to their folders
-- =====================================================

-- =====================================================
-- STEP 1: DELETE ALL EXISTING POLICIES
-- =====================================================

DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies on storage.objects and drop them
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
    
    RAISE NOTICE '✅ All existing Storage policies deleted';
END $$;

-- =====================================================
-- STEP 2: CREATE POLICIES FOR VIDEOS BUCKET
-- =====================================================

-- Public read access (anyone can view videos)
CREATE POLICY "videos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Authenticated users can upload videos to their own folder
CREATE POLICY "videos_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'videos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own videos
CREATE POLICY "videos_authenticated_update"
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

-- Users can delete their own videos
CREATE POLICY "videos_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'videos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STEP 3: CREATE POLICIES FOR THUMBNAILS BUCKET
-- =====================================================

-- Public read access (anyone can view thumbnails)
CREATE POLICY "thumbnails_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Authenticated users can upload thumbnails to their own folder
CREATE POLICY "thumbnails_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own thumbnails
CREATE POLICY "thumbnails_authenticated_update"
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

-- Users can delete their own thumbnails
CREATE POLICY "thumbnails_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'thumbnails' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STEP 4: CREATE POLICIES FOR AVATARS BUCKET
-- =====================================================

-- Public read access (anyone can view avatars)
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Authenticated users can upload avatars to their own folder
CREATE POLICY "avatars_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatars
CREATE POLICY "avatars_authenticated_update"
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

-- Users can delete their own avatars
CREATE POLICY "avatars_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STEP 5: CREATE POLICIES FOR BANNERS BUCKET
-- =====================================================

-- Public read access (anyone can view banners)
CREATE POLICY "banners_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Authenticated users can upload banners to their own folder
CREATE POLICY "banners_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'banners' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own banners
CREATE POLICY "banners_authenticated_update"
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

-- Users can delete their own banners
CREATE POLICY "banners_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'banners' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STEP 6: VERIFY POLICIES WERE CREATED
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'storage' 
    AND tablename = 'objects';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Storage Policy Reset Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Policy Summary:';
    RAISE NOTICE '  - Videos bucket: 4 policies (read, insert, update, delete)';
    RAISE NOTICE '  - Thumbnails bucket: 4 policies (read, insert, update, delete)';
    RAISE NOTICE '  - Avatars bucket: 4 policies (read, insert, update, delete)';
    RAISE NOTICE '  - Banners bucket: 4 policies (read, insert, update, delete)';
    RAISE NOTICE '';
    RAISE NOTICE '🎥 You can now upload videos!';
    RAISE NOTICE '📸 Authenticated users can upload to their own folders';
    RAISE NOTICE '👀 Everyone can view uploaded content';
    RAISE NOTICE '========================================';
END $$;

-- List all created policies
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    roles as "Roles"
FROM pg_policies
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;
