import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { Image as RNImage } from 'react-native';

export interface VideoUploadOptions {
  videoUri: string;
  title: string;
  description?: string;
  channelId: string;
  isShort?: boolean;
  visibility?: 'public' | 'unlisted' | 'private';
  category?: string;
  thumbnailUri?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

/**
 * Generate a thumbnail from a video file
 */
export async function generateThumbnail(videoUri: string): Promise<string | null> {
  try {
    // For now, return null - thumbnail generation requires native modules
    // In production, you would use expo-video-thumbnails or similar
    return null;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

/**
 * Get video duration in seconds
 */
export async function getVideoDuration(videoUri: string): Promise<number> {
  try {
    // This is a placeholder - actual implementation would use expo-av
    // to load the video and get its duration
    return 0;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0;
  }
}

/**
 * Upload a file to Supabase Storage
 */
async function uploadToStorage(
  bucket: string,
  path: string,
  fileUri: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    // Read file as base64
    const fileData = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob
    const response = await fetch(`data:video/mp4;base64,${fileData}`);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }
}

/**
 * Upload a video with thumbnail to Supabase
 */
export async function uploadVideo(
  options: VideoUploadOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ videoId: string; videoUrl: string } | null> {
  try {
    const {
      videoUri,
      title,
      description,
      channelId,
      isShort = false,
      visibility = 'public',
      category,
      thumbnailUri,
    } = options;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    onProgress?.({
      progress: 0,
      status: 'uploading',
      message: 'Preparing video...',
    });

    // Generate unique file names
    const videoFileName = `${user.id}/${Date.now()}_video.mp4`;
    const thumbnailFileName = `${user.id}/${Date.now()}_thumbnail.jpg`;

    // Upload video
    onProgress?.({
      progress: 10,
      status: 'uploading',
      message: 'Uploading video...',
    });

    const videoUrl = await uploadToStorage('videos', videoFileName, videoUri);
    if (!videoUrl) {
      throw new Error('Failed to upload video');
    }

    onProgress?.({
      progress: 60,
      status: 'uploading',
      message: 'Uploading thumbnail...',
    });

    // Upload or generate thumbnail
    let thumbnailUrl: string;
    if (thumbnailUri) {
      const uploadedThumbnail = await uploadToStorage(
        'thumbnails',
        thumbnailFileName,
        thumbnailUri
      );
      thumbnailUrl = uploadedThumbnail || '';
    } else {
      // Use a placeholder thumbnail
      thumbnailUrl = 'https://via.placeholder.com/1280x720?text=Video';
    }

    onProgress?.({
      progress: 80,
      status: 'processing',
      message: 'Creating video record...',
    });

    // Get video duration
    const duration = await getVideoDuration(videoUri);

    // Create video record in database
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert({
        channel_id: channelId,
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration,
        is_short: isShort,
        visibility,
        category: category || null,
      })
      .select()
      .single();

    if (videoError) {
      console.error('Error creating video record:', videoError);
      throw videoError;
    }

    onProgress?.({
      progress: 100,
      status: 'complete',
      message: 'Upload complete!',
    });

    return {
      videoId: videoData.id,
      videoUrl: videoData.video_url,
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    onProgress?.({
      progress: 0,
      status: 'error',
      message: error instanceof Error ? error.message : 'Upload failed',
    });
    return null;
  }
}

/**
 * Delete a video from Supabase
 */
export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    // Get video details
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('video_url, thumbnail_url')
      .eq('id', videoId)
      .single();

    if (fetchError || !video) {
      console.error('Error fetching video:', fetchError);
      return false;
    }

    // Extract file paths from URLs
    const videoPath = video.video_url.split('/videos/')[1];
    const thumbnailPath = video.thumbnail_url.split('/thumbnails/')[1];

    // Delete from storage
    if (videoPath) {
      await supabase.storage.from('videos').remove([videoPath]);
    }
    if (thumbnailPath) {
      await supabase.storage.from('thumbnails').remove([thumbnailPath]);
    }

    // Delete video record (cascades to comments, likes, etc.)
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    if (deleteError) {
      console.error('Error deleting video record:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
}

/**
 * Update video metadata
 */
export async function updateVideoMetadata(
  videoId: string,
  updates: {
    title?: string;
    description?: string;
    visibility?: 'public' | 'unlisted' | 'private';
    category?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', videoId);

    if (error) {
      console.error('Error updating video:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating video metadata:', error);
    return false;
  }
}
