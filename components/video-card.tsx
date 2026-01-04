import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface VideoCardProps {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  channelAvatar?: string;
  viewCount: number;
  uploadedAt: string;
  duration?: number;
  isShort?: boolean;
}

export function VideoCard({
  videoId,
  title,
  thumbnailUrl,
  channelName,
  channelAvatar,
  viewCount,
  uploadedAt,
  duration,
  isShort = false,
}: VideoCardProps) {
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);
    const diffYears = Math.floor(diffMs / 31536000000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${diffYears} years ago`;
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/video/${videoId}` as any);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="mb-4 active:opacity-70"
    >
      {/* Thumbnail */}
      <View className="relative w-full aspect-video bg-surface rounded-xl overflow-hidden">
        <Image
          source={{ uri: thumbnailUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {duration !== undefined && duration > 0 && (
          <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
            <Text className="text-white text-xs font-semibold">
              {formatDuration(duration)}
            </Text>
          </View>
        )}
        {isShort && (
          <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded">
            <Text className="text-white text-xs font-semibold">SHORT</Text>
          </View>
        )}
      </View>

      {/* Video Info */}
      <View className="flex-row mt-3 px-2">
        {/* Channel Avatar */}
        {channelAvatar && (
          <View className="w-9 h-9 rounded-full bg-surface mr-3 overflow-hidden">
            <Image
              source={{ uri: channelAvatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        {/* Title and Metadata */}
        <View className="flex-1">
          <Text
            className="text-foreground font-medium text-sm leading-5"
            numberOfLines={2}
          >
            {title}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-muted text-xs">{channelName}</Text>
            <Text className="text-muted text-xs mx-1">•</Text>
            <Text className="text-muted text-xs">
              {formatViewCount(viewCount)} views
            </Text>
            <Text className="text-muted text-xs mx-1">•</Text>
            <Text className="text-muted text-xs">{formatTimeAgo(uploadedAt)}</Text>
          </View>
        </View>

        {/* More Options */}
        <TouchableOpacity className="ml-2 p-1">
          <Text className="text-muted text-lg">⋮</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
