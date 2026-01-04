import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { VideoCard } from '@/components/video-card';
import { supabase } from '@/lib/supabase';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SearchResult {
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

export default function SearchScreen() {
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    // In a real app, load from AsyncStorage
    setRecentSearches(['React Native', 'Supabase Tutorial', 'Mobile Development']);
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
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
        .eq('visibility', 'public')
        .ilike('title', `%${searchQuery}%`)
        .order('view_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      performSearch(text);
    } else {
      setResults([]);
    }
  };

  const handleRecentSearchPress = (search: string) => {
    setQuery(search);
    performSearch(search);
  };

  const renderVideo = ({ item }: { item: SearchResult }) => (
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

  const renderEmpty = () => {
    if (loading) return null;
    if (!query) return null;
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-muted text-center">No results found for "{query}"</Text>
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View className="flex-1">
        {/* Search Header */}
        <View className="px-4 py-3 border-b border-border">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center bg-surface rounded-xl px-4 py-2 border border-border">
              <IconSymbol name="house.fill" size={20} color={colors.muted} />
              <TextInput
                className="flex-1 ml-2 text-foreground"
                placeholder="Search videos..."
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={handleSearch}
                autoFocus
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Text className="text-muted">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={renderEmpty}
          />
        ) : (
          <View className="p-4">
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <View>
                <Text className="text-foreground font-semibold text-lg mb-4">
                  Recent Searches
                </Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRecentSearchPress(search)}
                    className="flex-row items-center py-3 border-b border-border"
                  >
                    <IconSymbol name="house.fill" size={20} color={colors.muted} />
                    <Text className="flex-1 ml-3 text-foreground">{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending Searches */}
            {!query && (
              <View className="mt-6">
                <Text className="text-foreground font-semibold text-lg mb-4">
                  Trending
                </Text>
                {['Gaming', 'Music', 'Tech Reviews', 'Cooking'].map((trend, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRecentSearchPress(trend)}
                    className="flex-row items-center py-3 border-b border-border"
                  >
                    <Text className="text-primary mr-3">🔥</Text>
                    <Text className="flex-1 text-foreground">{trend}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
