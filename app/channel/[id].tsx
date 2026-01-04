import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { VideoCard } from '@/components/video-card';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  subscriber_count: number;
  video_count: number;
  profiles: {
    avatar_url: string | null;
  };
}

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  created_at: string;
  duration: number;
  is_short: boolean;
}

export default function ChannelScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'about'>('videos');

  useEffect(() => {
    if (id) {
      fetchChannel();
      fetchVideos();
      if (user) {
        checkSubscription();
      }
    }
  }, [id, user, activeTab]);

  const fetchChannel = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`
          id,
          name,
          description,
          subscriber_count,
          video_count,
          profiles (
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching channel:', error);
        return;
      }

      setChannel(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const query = supabase
        .from('videos')
        .select('id, title, thumbnail_url, view_count, created_at, duration, is_short')
        .eq('channel_id', id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (activeTab === 'shorts') {
        query.eq('is_short', true);
      } else if (activeTab === 'videos') {
        query.eq('is_short', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user.id)
        .eq('channel_id', id)
        .maybeSingle();

      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe');
      router.push('/auth/login' as any);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isSubscribed) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', user.id)
          .eq('channel_id', id);
        setIsSubscribed(false);
      } else {
        await supabase.from('subscriptions').insert({
          subscriber_id: user.id,
          channel_id: id as string,
        });
        setIsSubscribed(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      fetchChannel();
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'Failed to update subscription');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <VideoCard
      videoId={item.id}
      title={item.title}
      thumbnailUrl={item.thumbnail_url}
      channelName={channel?.name || ''}
      channelAvatar={channel?.profiles?.avatar_url || undefined}
      viewCount={item.view_count}
      uploadedAt={item.created_at}
      duration={item.duration}
      isShort={item.is_short}
    />
  );

  if (loading && !channel) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!channel) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <Text className="text-foreground text-lg mb-4">Channel not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-xl px-6 py-3"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        {/* Channel Header */}
        <View className="px-4 py-6 border-b border-border">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="w-20 h-20 rounded-full bg-surface mr-4" />
            <View className="flex-1">
              <Text className="text-foreground font-bold text-xl">{channel.name}</Text>
              <Text className="text-muted text-sm">
                {formatNumber(channel.subscriber_count)} subscribers •{' '}
                {channel.video_count} videos
              </Text>
            </View>
          </View>

          {channel.description && (
            <Text className="text-foreground mb-4" numberOfLines={2}>
              {channel.description}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubscribe}
            className={`rounded-full py-3 ${
              isSubscribed ? 'bg-surface border border-border' : 'bg-primary'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isSubscribed ? 'text-foreground' : 'text-white'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-border">
          {(['videos', 'shorts', 'about'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 border-b-2 ${
                activeTab === tab ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  activeTab === tab ? 'text-primary' : 'text-muted'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View className="p-4">
          {activeTab === 'about' ? (
            <View>
              <Text className="text-foreground font-semibold text-lg mb-2">About</Text>
              <Text className="text-foreground mb-4">
                {channel.description || 'No description available'}
              </Text>
              <View className="bg-surface rounded-xl p-4">
                <Text className="text-muted text-sm mb-2">
                  Subscribers: {formatNumber(channel.subscriber_count)}
                </Text>
                <Text className="text-muted text-sm">
                  Total videos: {channel.video_count}
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={videos}
              renderItem={renderVideo}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="py-20 items-center">
                  <Text className="text-muted">
                    No {activeTab === 'shorts' ? 'shorts' : 'videos'} yet
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
