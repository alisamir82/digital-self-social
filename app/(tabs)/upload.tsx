import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { uploadVideo, UploadProgress } from '@/lib/video-upload';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

export default function UploadScreen() {
  const colors = useColors();
  const { user, isAuthenticated } = useSupabaseAuth();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isShort, setIsShort] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to upload videos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const recordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to record videos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const pickThumbnail = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setThumbnailUri(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', 'Failed to pick thumbnail');
    }
  };

  const handleUpload = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'Please select a video to upload');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your video');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to upload videos');
      router.push('/auth/login' as any);
      return;
    }

    try {
      setUploading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Get user's channel
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (channelError || !channel) {
        Alert.alert('Error', 'You need to create a channel first');
        setUploading(false);
        return;
      }

      // Upload video
      const result = await uploadVideo(
        {
          videoUri,
          title: title.trim(),
          description: description.trim() || undefined,
          channelId: channel.id,
          isShort,
          visibility,
          thumbnailUri: thumbnailUri || undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setUploading(false);

      if (result) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success',
          'Your video has been uploaded successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setVideoUri(null);
                setThumbnailUri(null);
                setTitle('');
                setDescription('');
                setVisibility('public');
                setIsShort(false);
                setUploadProgress(null);
                router.push('/(tabs)');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to upload video. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      Alert.alert('Error', 'An error occurred during upload');
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Sign In Required</Text>
        <Text className="text-muted text-center mb-6">
          You need to be signed in to upload videos
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

  if (!videoUri) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <View className="items-center gap-6 w-full">
          <IconSymbol name="house.fill" size={64} color={colors.primary} />
          <Text className="text-2xl font-bold text-foreground">Upload Video</Text>
          <Text className="text-muted text-center mb-4">
            Share your content with the Digital Self Social community
          </Text>

          <TouchableOpacity
            onPress={recordVideo}
            className="bg-primary rounded-xl py-4 w-full active:opacity-90"
          >
            <Text className="text-white text-center font-semibold text-base">
              Record Video
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickVideo}
            className="bg-surface border border-border rounded-xl py-4 w-full active:opacity-70"
          >
            <Text className="text-foreground text-center font-semibold text-base">
              Choose from Library
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-foreground mb-6">Video Details</Text>

        {/* Video Selected Indicator */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <Text className="text-foreground font-medium">Video Selected</Text>
          <Text className="text-muted text-sm mt-1">
            {videoUri.split('/').pop()}
          </Text>
          <TouchableOpacity
            onPress={() => setVideoUri(null)}
            className="mt-2"
          >
            <Text className="text-primary text-sm">Change Video</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Title *</Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            placeholder="Enter video title"
            placeholderTextColor="#9BA1A6"
            value={title}
            onChangeText={setTitle}
            editable={!uploading}
            maxLength={100}
          />
          <Text className="text-muted text-xs mt-1">{title.length}/100</Text>
        </View>

        {/* Description Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Description</Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
            placeholder="Tell viewers about your video"
            placeholderTextColor="#9BA1A6"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!uploading}
            maxLength={500}
          />
          <Text className="text-muted text-xs mt-1">{description.length}/500</Text>
        </View>

        {/* Thumbnail */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Thumbnail</Text>
          <TouchableOpacity
            onPress={pickThumbnail}
            disabled={uploading}
            className="bg-surface border border-border rounded-xl py-3 items-center active:opacity-70"
          >
            <Text className="text-foreground">
              {thumbnailUri ? 'Change Thumbnail' : 'Add Custom Thumbnail'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Visibility */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Visibility</Text>
          <View className="flex-row gap-2">
            {(['public', 'unlisted', 'private'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setVisibility(option)}
                disabled={uploading}
                className={`flex-1 rounded-xl py-3 border ${
                  visibility === option
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    visibility === option ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Short Video Toggle */}
        <TouchableOpacity
          onPress={() => setIsShort(!isShort)}
          disabled={uploading}
          className="flex-row items-center justify-between bg-surface rounded-xl p-4 mb-6 border border-border"
        >
          <Text className="text-foreground font-medium">Short Video</Text>
          <View
            className={`w-12 h-6 rounded-full ${
              isShort ? 'bg-primary' : 'bg-border'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full bg-white mt-0.5 ${
                isShort ? 'ml-6' : 'ml-0.5'
              }`}
            />
          </View>
        </TouchableOpacity>

        {/* Upload Progress */}
        {uploading && uploadProgress && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <Text className="text-foreground font-medium mb-2">
              {uploadProgress.message}
            </Text>
            <View className="bg-border rounded-full h-2 overflow-hidden">
              <View
                className="bg-primary h-full"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </View>
            <Text className="text-muted text-sm mt-2">
              {Math.round(uploadProgress.progress)}%
            </Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading || !title.trim()}
          className={`rounded-xl py-4 mb-8 ${
            uploading || !title.trim() ? 'bg-border' : 'bg-primary'
          }`}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-center font-semibold text-base">
              Upload Video
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
