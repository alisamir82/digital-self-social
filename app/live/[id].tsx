import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { VideoPlayer } from '@/components/video-player';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface LiveStream {
  id: string;
  title: string;
  stream_url: string;
  viewer_count: number;
  channels: {
    name: string;
  };
}

export default function LiveStreamScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      fetchStream();
      subscribeToChat();
      subscribeToViewerCount();
    }
  }, [id]);

  const fetchStream = async () => {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          id,
          title,
          stream_url,
          viewer_count,
          channels (
            name
          )
        `)
        .eq('id', id)
        .eq('is_live', true)
        .single();

      if (error) {
        console.error('Error fetching stream:', error);
        return;
      }

      setStream(data);
      setViewerCount(data.viewer_count);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const subscribeToChat = () => {
    // Fetch initial messages
    supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        created_at,
        profiles (
          username
        )
      `)
      .eq('live_stream_id', id)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) {
          setMessages(data);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      });

    // Subscribe to new messages
    const subscription = supabase
      .channel(`chat:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `live_stream_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Fetch the profile data for the new message
          supabase
            .from('profiles')
            .select('username')
            .eq('id', newMessage.user_id)
            .single()
            .then(({ data: profile }) => {
              setMessages((prev) => [
                ...prev,
                {
                  ...newMessage,
                  profiles: { username: profile?.username || 'Anonymous' },
                },
              ]);
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const subscribeToViewerCount = () => {
    const subscription = supabase
      .channel(`viewers:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_streams',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setViewerCount(updated.viewer_count);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!user || !messageText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        live_stream_id: id as string,
        user_id: user.id,
        content: messageText.trim(),
      });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      setMessageText('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View className="mb-2">
      <Text className="text-foreground">
        <Text className="font-semibold">{item.profiles.username}: </Text>
        {item.content}
      </Text>
    </View>
  );

  if (!stream) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-muted">Loading live stream...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Video Player */}
          <VideoPlayer videoUrl={stream.stream_url} autoPlay />

          {/* Stream Info */}
          <View className="px-4 py-3 border-b border-border">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="bg-error px-2 py-1 rounded mr-2">
                  <Text className="text-white text-xs font-bold">LIVE</Text>
                </View>
                <Text className="text-muted text-sm">{viewerCount} watching</Text>
              </View>
            </View>
            <Text className="text-foreground font-semibold text-lg">{stream.title}</Text>
            <Text className="text-muted text-sm">{stream.channels.name}</Text>
          </View>

          {/* Chat */}
          <View className="flex-1 px-4 pt-2">
            <Text className="text-foreground font-semibold mb-2">Live Chat</Text>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              className="flex-1 mb-2"
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />
          </View>

          {/* Message Input */}
          {user && (
            <View className="px-4 pb-4 border-t border-border">
              <View className="flex-row items-center gap-2 pt-2">
                <TextInput
                  className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-foreground"
                  placeholder="Say something..."
                  placeholderTextColor={colors.muted}
                  value={messageText}
                  onChangeText={setMessageText}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!messageText.trim()}
                  className={`px-4 py-2 rounded-xl ${
                    messageText.trim() ? 'bg-primary' : 'bg-surface'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      messageText.trim() ? 'text-white' : 'text-muted'
                    }`}
                  >
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
