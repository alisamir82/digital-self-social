import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { VideoCard } from '@/components/video-card';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  created_at: string;
  duration: number;
  is_short: boolean;
  channels: {
    name: string;
    profiles: {
      avatar_url: string | null;
    };
  };
}

export default function LibraryScreen() {
  const colors = useColors();
  const { user, isAuthenticated } = useSupabaseAuth();
  const [watchHistory, setWatchHistory] = useState<Video[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'liked'>('history');

  useEffect(() => {
    if (isAuthenticated) {
      fetchLibraryData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

  const fetchLibraryData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (activeTab === 'history') {
        // Fetch watch history
        const { data, error } = await supabase
          .from('watch_history')
          .select(`
            videos (
              id,
              title,
              thumbnail_url,
              view_count,
              created_at,
              duration,
              is_short,
              channels (
                name,
                profiles (
                  avatar_url
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching watch history:', error);
          return;
        }

        const videos = data?.map((item: any) => item.videos).filter(Boolean) || [];
        setWatchHistory(videos);
      } else {
        // Fetch liked videos
        const { data, error } = await supabase
          .from('likes')
          .select(`
            videos (
              id,
              title,
              thumbnail_url,
              view_count,
              created_at,
              duration,
              is_short,
              channels (
                name,
                profiles (
                  avatar_url
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_like', true)
          .not('video_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching liked videos:', error);
          return;
        }

        const videos = data?.map((item: any) => item.videos).filter(Boolean) || [];
        setLikedVideos(videos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <VideoCard
      videoId={item.id}
      title={item.title}
      thumbnailUrl={item.thumbnail_url}
      channelName={item.channels?.name || 'Unknown Channel'}
      channelAvatar={item.channels?.profiles?.avatar_url || undefined}
      viewCount={item.view_count}
      uploadedAt={item.created_at}
      duration={item.duration}
      isShort={item.is_short}
    />
  );

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Sign In Required</Text>
        <Text className="text-muted text-center mb-6">
          Sign in to access your library, watch history, and liked videos
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/login' as any)}
          className="bg-primary rounded-xl px-8 py-3"
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const currentVideos = activeTab === 'history' ? watchHistory : likedVideos;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-2xl font-bold text-foreground mb-4">Library</Text>
          
          {/* Tabs */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-xl ${
                activeTab === 'history' ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'history' ? 'text-white' : 'text-foreground'
                }`}
              >
                Watch History
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('liked')}
              className={`flex-1 py-2 rounded-xl ${
                activeTab === 'liked' ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'liked' ? 'text-white' : 'text-foreground'
                }`}
              >
                Liked Videos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={currentVideos}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-muted text-center">
                  {activeTab === 'history'
                    ? 'No watch history yet'
                    : 'No liked videos yet'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}
