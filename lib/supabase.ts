import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Supabase configuration
// Users need to provide these values in environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please configure environment variables.');
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types will be generated from Supabase schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          banner_url: string | null;
          subscriber_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          banner_url?: string | null;
          subscriber_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          banner_url?: string | null;
          subscriber_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          channel_id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string;
          duration: number;
          view_count: number;
          like_count: number;
          dislike_count: number;
          is_short: boolean;
          visibility: 'public' | 'unlisted' | 'private';
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url: string;
          duration?: number;
          view_count?: number;
          like_count?: number;
          dislike_count?: number;
          is_short?: boolean;
          visibility?: 'public' | 'unlisted' | 'private';
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string;
          duration?: number;
          view_count?: number;
          like_count?: number;
          dislike_count?: number;
          is_short?: boolean;
          visibility?: 'public' | 'unlisted' | 'private';
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          parent_id?: string | null;
          content: string;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          parent_id?: string | null;
          content?: string;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          video_id: string | null;
          comment_id: string | null;
          is_like: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id?: string | null;
          comment_id?: string | null;
          is_like?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string | null;
          comment_id?: string | null;
          is_like?: boolean;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          subscriber_id: string;
          channel_id: string;
          notification_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscriber_id: string;
          channel_id: string;
          notification_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscriber_id?: string;
          channel_id?: string;
          notification_enabled?: boolean;
          created_at?: string;
        };
      };
      playlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          visibility: 'public' | 'unlisted' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          visibility?: 'public' | 'unlisted' | 'private';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          visibility?: 'public' | 'unlisted' | 'private';
          created_at?: string;
          updated_at?: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          watched_at: string;
          progress: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          watched_at?: string;
          progress?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string;
          watched_at?: string;
          progress?: number;
        };
      };
      live_streams: {
        Row: {
          id: string;
          channel_id: string;
          title: string;
          description: string | null;
          stream_url: string;
          thumbnail_url: string;
          viewer_count: number;
          is_live: boolean;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          title: string;
          description?: string | null;
          stream_url: string;
          thumbnail_url: string;
          viewer_count?: number;
          is_live?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          title?: string;
          description?: string | null;
          stream_url?: string;
          thumbnail_url?: string;
          viewer_count?: number;
          is_live?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          stream_id: string | null;
          room_id: string | null;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stream_id?: string | null;
          room_id?: string | null;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          stream_id?: string | null;
          room_id?: string | null;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      chat_rooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
