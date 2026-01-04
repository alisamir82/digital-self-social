import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
}

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      fetchRoom();
      fetchMessages();
      subscribeToMessages();
      subscribeToPresence();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id, name, description, member_count')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching room:', error);
        return;
      }

      setRoom(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('chat_room_id', id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`room:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Fetch profile data
          supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', newMessage.user_id)
            .single()
            .then(({ data: profile }) => {
              setMessages((prev) => [
                ...prev,
                {
                  ...newMessage,
                  profiles: profile || { username: 'Anonymous', avatar_url: null },
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

  const subscribeToPresence = () => {
    if (!user) return;

    const channel = supabase.channel(`presence:${id}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!user || !messageText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        chat_room_id: id as string,
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

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwnMessage = item.user_id === user?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.user_id !== item.user_id;

    return (
      <View
        className={`mb-3 flex-row ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwnMessage && (
          <View className="w-8 h-8 rounded-full bg-surface mr-2">
            {showAvatar && <View className="w-full h-full rounded-full bg-primary" />}
          </View>
        )}
        <View className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwnMessage && (
            <Text className="text-muted text-xs mb-1">{item.profiles.username}</Text>
          )}
          <View
            className={`px-4 py-2 rounded-2xl ${
              isOwnMessage ? 'bg-primary' : 'bg-surface'
            }`}
          >
            <Text className={isOwnMessage ? 'text-white' : 'text-foreground'}>
              {item.content}
            </Text>
          </View>
          <Text className="text-muted text-xs mt-1">{formatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
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
          {/* Header */}
          <View className="px-4 py-3 border-b border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                  <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-lg">
                    {room?.name || 'Chat Room'}
                  </Text>
                  <Text className="text-muted text-sm">{onlineCount} online</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-muted text-center">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />

          {/* Input */}
          {user ? (
            <View className="px-4 pb-4 border-t border-border">
              <View className="flex-row items-center gap-2 pt-2">
                <TextInput
                  className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-foreground"
                  placeholder="Type a message..."
                  placeholderTextColor={colors.muted}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!messageText.trim()}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    messageText.trim() ? 'bg-primary' : 'bg-surface'
                  }`}
                >
                  <IconSymbol
                    name="paperplane.fill"
                    size={20}
                    color={messageText.trim() ? '#FFFFFF' : colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="px-4 pb-4 border-t border-border items-center py-4">
              <Text className="text-muted mb-2">Sign in to join the conversation</Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/login' as any)}
                className="bg-primary rounded-xl px-6 py-2"
              >
                <Text className="text-white font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
