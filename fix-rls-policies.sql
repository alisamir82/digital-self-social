-- =====================================================
-- Fix Row-Level Security (RLS) Policies
-- Digital Self Social - Authentication Fix
-- =====================================================
--
-- This script fixes RLS policies that are preventing users from:
-- 1. Creating profiles after sign-up
-- 2. Creating channels
-- 3. Uploading videos
-- 4. Posting comments
--
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Create new permissive policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CHANNELS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Channels are viewable by everyone" ON channels;
DROP POLICY IF EXISTS "Users can create their own channel" ON channels;
DROP POLICY IF EXISTS "Users can update their own channel" ON channels;
DROP POLICY IF EXISTS "Users can delete their own channel" ON channels;

-- Create new policies
CREATE POLICY "Channels are viewable by everyone"
ON channels FOR SELECT
USING (true);

CREATE POLICY "Users can create their own channel"
ON channels FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channel"
ON channels FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channel"
ON channels FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VIDEOS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Users can upload videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

-- Create new policies
CREATE POLICY "Videos are viewable by everyone"
ON videos FOR SELECT
USING (true);

CREATE POLICY "Users can upload videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
ON videos FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON videos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can post comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Create new policies
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Users can post comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- LIKES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Users can like content" ON likes;
DROP POLICY IF EXISTS "Users can unlike content" ON likes;

-- Create new policies
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

CREATE POLICY "Users can like content"
ON likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike content"
ON likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Subscriptions are viewable by everyone" ON subscriptions;
DROP POLICY IF EXISTS "Users can subscribe to channels" ON subscriptions;
DROP POLICY IF EXISTS "Users can unsubscribe from channels" ON subscriptions;

-- Create new policies
CREATE POLICY "Subscriptions are viewable by everyone"
ON subscriptions FOR SELECT
USING (true);

CREATE POLICY "Users can subscribe to channels"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "Users can unsubscribe from channels"
ON subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = subscriber_id);

-- Ensure RLS is enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WATCH HISTORY TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own watch history" ON watch_history;
DROP POLICY IF EXISTS "Users can add to watch history" ON watch_history;
DROP POLICY IF EXISTS "Users can delete their watch history" ON watch_history;

-- Create new policies
CREATE POLICY "Users can view their own watch history"
ON watch_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to watch history"
ON watch_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their watch history"
ON watch_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- LIVE STREAMS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Live streams are viewable by everyone" ON live_streams;
DROP POLICY IF EXISTS "Users can create live streams" ON live_streams;
DROP POLICY IF EXISTS "Users can update their own live streams" ON live_streams;
DROP POLICY IF EXISTS "Users can delete their own live streams" ON live_streams;

-- Create new policies
CREATE POLICY "Live streams are viewable by everyone"
ON live_streams FOR SELECT
USING (true);

CREATE POLICY "Users can create live streams"
ON live_streams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own live streams"
ON live_streams FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own live streams"
ON live_streams FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CHAT MESSAGES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Chat messages are viewable by everyone" ON chat_messages;
DROP POLICY IF EXISTS "Users can send chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- Create new policies
CREATE POLICY "Chat messages are viewable by everyone"
ON chat_messages FOR SELECT
USING (true);

CREATE POLICY "Users can send chat messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PLAYLISTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Playlists are viewable by everyone" ON playlists;
DROP POLICY IF EXISTS "Users can create playlists" ON playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;

-- Create new policies
CREATE POLICY "Playlists are viewable by everyone"
ON playlists FOR SELECT
USING (true);

CREATE POLICY "Users can create playlists"
ON playlists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
ON playlists FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
ON playlists FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ All RLS policies have been fixed!';
  RAISE NOTICE '📝 Policies updated for: profiles, channels, videos, comments, likes, subscriptions, watch_history, live_streams, chat_messages, playlists';
  RAISE NOTICE '🔒 Row-Level Security is enabled on all tables';
  RAISE NOTICE '✨ Users can now sign up and create content!';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- To verify policies were created, check in Supabase dashboard:
-- Database > [table name] > Policies
-- You should see policies listed for each table
-- =====================================================
