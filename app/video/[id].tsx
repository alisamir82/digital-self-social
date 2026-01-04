import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { VideoPlayer } from '@/components/video-player';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  created_at: string;
  channels: {
    id: string;
    name: string;
    subscriber_count: number;
    profiles: {
      avatar_url: string | null;
    };
  };
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideo();
      incrementViewCount();
      if (user) {
        checkUserInteractions();
      }
    }
  }, [id, user]);

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          view_count,
          like_count,
          dislike_count,
          created_at,
          channels (
            id,
            name,
            subscriber_count,
            profiles (
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching video:', error);
        Alert.alert('Error', 'Failed to load video');
        return;
      }

      setVideo(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_video_views', { video_uuid: id });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const checkUserInteractions = async () => {
    if (!user) return;

    try {
      // Check if user liked/disliked
      const { data: likeData } = await supabase
        .from('likes')
        .select('is_like')
        .eq('user_id', user.id)
        .eq('video_id', id)
        .maybeSingle();

      if (likeData) {
        setIsLiked(likeData.is_like);
        setIsDisliked(!likeData.is_like);
      }

      // Check if user is subscribed
      if (video?.channels?.id) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('subscriber_id', user.id)
          .eq('channel_id', video.channels.id)
          .maybeSingle();

        setIsSubscribed(!!subData);
      }
    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like videos');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', id);
        setIsLiked(false);
      } else {
        // Add or update like
        await supabase.from('likes').upsert({
          user_id: user.id,
          video_id: id as string,
          is_like: true,
        });
        setIsLiked(true);
        setIsDisliked(false);
      }
      fetchVideo(); // Refresh counts
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to dislike videos');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (isDisliked) {
        // Remove dislike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', id);
        setIsDisliked(false);
      } else {
        // Add or update dislike
        await supabase.from('likes').upsert({
          user_id: user.id,
          video_id: id as string,
          is_like: false,
        });
        setIsDisliked(true);
        setIsLiked(false);
      }
      fetchVideo(); // Refresh counts
    } catch (error) {
      console.error('Error disliking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe');
      return;
    }

    if (!video?.channels?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isSubscribed) {
        // Unsubscribe
        await supabase
          .from('subscriptions')
          .delete()
          .eq('subscriber_id', user.id)
          .eq('channel_id', video.channels.id);
        setIsSubscribed(false);
      } else {
        // Subscribe
        await supabase.from('subscriptions').insert({
          subscriber_id: user.id,
          channel_id: video.channels.id,
        });
        setIsSubscribed(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      fetchVideo(); // Refresh counts
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!video) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <Text className="text-foreground text-lg mb-4">Video not found</Text>
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
        {/* Video Player */}
        <VideoPlayer videoUrl={video.video_url} thumbnailUrl={video.thumbnail_url} autoPlay />

        {/* Video Info */}
        <View className="p-4">
          {/* Title */}
          <Text className="text-foreground text-lg font-semibold mb-2">
            {video.title}
          </Text>

          {/* Views */}
          <Text className="text-muted text-sm mb-4">
            {formatNumber(video.view_count)} views
          </Text>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleLike}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  isLiked ? 'bg-primary border-primary' : 'bg-surface border-border'
                }`}
              >
                <Text className={isLiked ? 'text-white font-semibold' : 'text-foreground'}>
                  👍 {formatNumber(video.like_count)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDislike}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  isDisliked ? 'bg-primary border-primary' : 'bg-surface border-border'
                }`}
              >
                <Text className={isDisliked ? 'text-white font-semibold' : 'text-foreground'}>
                  👎 {formatNumber(video.dislike_count)}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity className="px-4 py-2 rounded-full bg-surface border border-border">
              <Text className="text-foreground">Share</Text>
            </TouchableOpacity>
          </View>

          {/* Channel Info */}
          <View className="flex-row items-center justify-between py-4 border-t border-b border-border">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-surface mr-3" />
              <View className="flex-1">
                <Text className="text-foreground font-semibold">
                  {video.channels.name}
                </Text>
                <Text className="text-muted text-sm">
                  {formatNumber(video.channels.subscriber_count)} subscribers
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubscribe}
              className={`px-6 py-2 rounded-full ${
                isSubscribed ? 'bg-surface border border-border' : 'bg-primary'
              }`}
            >
              <Text
                className={`font-semibold ${
                  isSubscribed ? 'text-foreground' : 'text-white'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {video.description && (
            <View className="mt-4 bg-surface rounded-xl p-4">
              <Text
                className="text-foreground"
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {video.description}
              </Text>
              {video.description.length > 100 && (
                <TouchableOpacity
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2"
                >
                  <Text className="text-primary font-semibold">
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Comments Section Placeholder */}
          <View className="mt-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Comments</Text>
            <Text className="text-muted text-center py-8">
              Comments feature coming soon
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
