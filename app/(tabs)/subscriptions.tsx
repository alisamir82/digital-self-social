import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
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

export default function SubscriptionsScreen() {
  const colors = useColors();
  const { user, isAuthenticated } = useSupabaseAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionVideos();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSubscriptionVideos = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's subscribed channels
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('channel_id')
        .eq('subscriber_id', user.id);

      if (subError) {
        console.error('Error fetching subscriptions:', subError);
        return;
      }

      if (!subscriptions || subscriptions.length === 0) {
        setVideos([]);
        return;
      }

      const channelIds = subscriptions.map((sub) => sub.channel_id);

      // Fetch videos from subscribed channels
      const { data, error } = await supabase
        .from('videos')
        .select(`
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
        `)
        .in('channel_id', channelIds)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscriptionVideos();
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
          Sign in to see videos from channels you subscribe to
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

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Loading subscriptions...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View className="flex-1">
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">Subscriptions</Text>
        </View>
        <FlatList
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-muted text-center mb-4">
                No videos from your subscriptions yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)' as any)}
                className="bg-primary rounded-xl px-6 py-3"
              >
                <Text className="text-white font-semibold">Explore Videos</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}
