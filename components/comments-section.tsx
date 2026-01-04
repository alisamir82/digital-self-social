import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface Comment {
  id: string;
  content: string;
  like_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentsSectionProps {
  videoId: string;
}

export function CommentsSection({ videoId }: CommentsSectionProps) {
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  useEffect(() => {
    fetchComments();
    
    // Subscribe to real-time comment updates
    const subscription = supabase
      .channel(`comments:${videoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [videoId, sortBy]);

  const fetchComments = async () => {
    try {
      const orderColumn = sortBy === 'top' ? 'like_count' : 'created_at';
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          like_count,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('video_id', videoId)
        .is('parent_id', null)
        .order(orderColumn, { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setPosting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase.from('comments').insert({
        video_id: videoId,
        user_id: user.id,
        content: commentText.trim(),
      });

      if (error) {
        console.error('Error posting comment:', error);
        Alert.alert('Error', 'Failed to post comment');
        return;
      }

      setCommentText('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchComments();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPosting(false);
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to like comments');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .maybeSingle();

      if (existingLike) {
        // Remove like
        await supabase.from('likes').delete().eq('id', existingLike.id);
      } else {
        // Add like
        await supabase.from('likes').insert({
          user_id: user.id,
          comment_id: commentId,
          is_like: true,
        });
      }

      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="py-3 border-b border-border">
      <View className="flex-row">
        <View className="w-8 h-8 rounded-full bg-surface mr-3" />
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-foreground font-semibold text-sm">
              {item.profiles?.username || 'Anonymous'}
            </Text>
            <Text className="text-muted text-xs ml-2">
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text className="text-foreground mb-2">{item.content}</Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => likeComment(item.id)}
              className="flex-row items-center"
            >
              <Text className="text-muted text-sm mr-1">👍</Text>
              <Text className="text-muted text-sm">{item.like_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-muted text-sm">Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Sort Options */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-foreground font-semibold text-lg">
          {comments.length} Comments
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setSortBy('top')}
            className={`px-3 py-1 rounded-full ${
              sortBy === 'top' ? 'bg-primary' : 'bg-surface'
            }`}
          >
            <Text
              className={`text-sm ${
                sortBy === 'top' ? 'text-white font-semibold' : 'text-foreground'
              }`}
            >
              Top
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('newest')}
            className={`px-3 py-1 rounded-full ${
              sortBy === 'newest' ? 'bg-primary' : 'bg-surface'
            }`}
          >
            <Text
              className={`text-sm ${
                sortBy === 'newest' ? 'text-white font-semibold' : 'text-foreground'
              }`}
            >
              Newest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comment Input */}
      <View className="flex-row items-center mb-4 gap-2">
        <View className="w-8 h-8 rounded-full bg-surface" />
        <View className="flex-1 flex-row items-center bg-surface rounded-xl px-4 py-2 border border-border">
          <TextInput
            className="flex-1 text-foreground"
            placeholder="Add a comment..."
            placeholderTextColor={colors.muted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            editable={!posting}
          />
          {commentText.trim().length > 0 && (
            <TouchableOpacity
              onPress={postComment}
              disabled={posting}
              className="ml-2"
            >
              {posting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text className="text-primary font-semibold">Post</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Comments List */}
      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="py-8 items-center">
              <Text className="text-muted">No comments yet. Be the first!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
