-- Digital Self Social (DS Social) - Supabase Database Schema
-- This SQL file contains all the table definitions for the YouTube-like platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  is_short BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table (for both videos and comments)
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_like BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id),
  UNIQUE(user_id, comment_id),
  CHECK ((video_id IS NOT NULL AND comment_id IS NULL) OR (video_id IS NULL AND comment_id IS NOT NULL))
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, channel_id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist videos junction table
CREATE TABLE IF NOT EXISTS playlist_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, video_id)
);

-- Watch history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, video_id)
);

-- Live streams table
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  viewer_count INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table (for both live streams and chat rooms)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((stream_id IS NOT NULL AND room_id IS NULL) OR (stream_id IS NULL AND room_id IS NOT NULL))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_is_short ON videos(is_short);
CREATE INDEX IF NOT EXISTS idx_videos_visibility ON videos(visibility);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_video_id ON likes(video_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel_id ON subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_chat_messages_stream_id ON chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);

-- Row Level Security (RLS) Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Channels
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public channels are viewable by everyone" ON channels FOR SELECT USING (true);
CREATE POLICY "Users can create own channel" ON channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channel" ON channels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own channel" ON channels FOR DELETE USING (auth.uid() = user_id);

-- Videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public videos are viewable by everyone" ON videos FOR SELECT USING (visibility = 'public' OR visibility = 'unlisted');
CREATE POLICY "Users can view own videos" ON videos FOR SELECT USING (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create videos on own channel" ON videos FOR INSERT WITH CHECK (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own videos" ON videos FOR UPDATE USING (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own videos" ON videos FOR DELETE USING (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscriptions are viewable by everyone" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can subscribe" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = subscriber_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = subscriber_id);
CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = subscriber_id);

-- Playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public playlists are viewable by everyone" ON playlists FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users can create own playlists" ON playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playlists" ON playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlists" ON playlists FOR DELETE USING (auth.uid() = user_id);

-- Playlist videos
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlist videos are viewable by everyone" ON playlist_videos FOR SELECT USING (true);
CREATE POLICY "Users can add videos to own playlists" ON playlist_videos FOR INSERT WITH CHECK (
  playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can remove videos from own playlists" ON playlist_videos FOR DELETE USING (
  playlist_id IN (SELECT id FROM playlists WHERE user_id = auth.uid())
);

-- Watch history
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watch history" ON watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own watch history" ON watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watch history" ON watch_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watch history" ON watch_history FOR DELETE USING (auth.uid() = user_id);

-- Live streams
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Live streams are viewable by everyone" ON live_streams FOR SELECT USING (true);
CREATE POLICY "Users can create streams on own channel" ON live_streams FOR INSERT WITH CHECK (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own streams" ON live_streams FOR UPDATE USING (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own streams" ON live_streams FOR DELETE USING (
  channel_id IN (SELECT id FROM channels WHERE user_id = auth.uid())
);

-- Chat rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active chat rooms are viewable by everyone" ON chat_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create chat rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Room creators can update their rooms" ON chat_rooms FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Room creators can delete their rooms" ON chat_rooms FOR DELETE USING (auth.uid() = created_by);

-- Chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages are viewable by everyone" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Functions for updating counts

-- Function to update video view count
CREATE OR REPLACE FUNCTION increment_video_views(video_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE videos SET view_count = view_count + 1 WHERE id = video_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update like/dislike counts
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.video_id IS NOT NULL THEN
      IF NEW.is_like THEN
        UPDATE videos SET like_count = like_count + 1 WHERE id = NEW.video_id;
      ELSE
        UPDATE videos SET dislike_count = dislike_count + 1 WHERE id = NEW.video_id;
      END IF;
    ELSIF NEW.comment_id IS NOT NULL THEN
      IF NEW.is_like THEN
        UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.video_id IS NOT NULL THEN
      IF OLD.is_like THEN
        UPDATE videos SET like_count = like_count - 1 WHERE id = OLD.video_id;
      ELSE
        UPDATE videos SET dislike_count = dislike_count - 1 WHERE id = OLD.video_id;
      END IF;
    ELSIF OLD.comment_id IS NOT NULL THEN
      IF OLD.is_like THEN
        UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_like_counts_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- Function to update subscriber count
CREATE OR REPLACE FUNCTION update_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels SET subscriber_count = subscriber_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels SET subscriber_count = subscriber_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_subscriber_count_trigger
AFTER INSERT OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_subscriber_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage buckets (to be created in Supabase Storage UI)
-- Bucket: videos (public)
-- Bucket: thumbnails (public)
-- Bucket: avatars (public)
-- Bucket: banners (public)

-- Storage policies will be configured in Supabase UI:
-- 1. Allow authenticated users to upload to their own folders
-- 2. Allow public read access to all files
