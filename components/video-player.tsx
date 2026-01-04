import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as ScreenOrientation from 'expo-screen-orientation';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  onPlaybackStatusUpdate?: (isPlaying: boolean) => void;
}

export function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  autoPlay = false,
  onPlaybackStatusUpdate,
}: VideoPlayerProps) {
  const colors = useColors();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = false;
    if (autoPlay) {
      player.play();
    }
  });

  useEffect(() => {
    const subscription = player.addListener('playingChange', (newIsPlaying) => {
      setIsPlaying(newIsPlaying);
      onPlaybackStatusUpdate?.(newIsPlaying);
    });

    const statusSubscription = player.addListener('statusChange', (status) => {
      if (status === 'readyToPlay') {
        setIsLoading(false);
      } else if (status === 'loading') {
        setIsLoading(true);
      }
    });

    return () => {
      subscription.remove();
      statusSubscription.remove();
      player.release();
    };
  }, [player]);

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetControlsTimeout();
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePlayerPress = () => {
    resetControlsTimeout();
  };

  return (
    <View className="relative w-full aspect-video bg-black">
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Touch Area for Controls */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePlayerPress}
        className="absolute inset-0"
      >
        {/* Play/Pause Button */}
        {showControls && !isLoading && (
          <View className="absolute inset-0 justify-center items-center">
            <TouchableOpacity
              onPress={togglePlayPause}
              className="bg-black/60 rounded-full p-4"
            >
              <IconSymbol
                name={isPlaying ? 'house.fill' : 'paperplane.fill'}
                size={48}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
