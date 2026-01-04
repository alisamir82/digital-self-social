import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';

interface Profile {
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfileScreen() {
  const colors = useColors();
  const { user, signOut } = useSupabaseAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setUsername(data.username || '');
      setFullName(data.full_name || '');
      setBio(data.bio || '');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center px-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Sign In Required</Text>
        <Text className="text-muted text-center mb-6">
          Sign in to view and edit your profile
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

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Profile</Text>
          </View>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text className="text-primary font-semibold">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="p-6">
          {/* Avatar */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-surface mb-3" />
            {editing && (
              <TouchableOpacity>
                <Text className="text-primary font-semibold">Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Username */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Username</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Enter username"
              placeholderTextColor={colors.muted}
              value={username}
              onChangeText={setUsername}
              editable={editing}
              autoCapitalize="none"
            />
          </View>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Full Name</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Enter full name"
              placeholderTextColor={colors.muted}
              value={fullName}
              onChangeText={setFullName}
              editable={editing}
            />
          </View>

          {/* Bio */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-2">Bio</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.muted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={editing}
              maxLength={200}
            />
            {editing && (
              <Text className="text-muted text-xs mt-1">{bio.length}/200</Text>
            )}
          </View>

          {/* Save/Cancel Buttons */}
          {editing && (
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setUsername(profile?.username || '');
                  setFullName(profile?.full_name || '');
                  setBio(profile?.bio || '');
                }}
                className="flex-1 bg-surface border border-border rounded-xl py-3"
              >
                <Text className="text-foreground text-center font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 bg-primary rounded-xl py-3"
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-center font-semibold">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Account Section */}
          <View className="border-t border-border pt-6">
            <Text className="text-foreground font-semibold text-lg mb-4">Account</Text>
            
            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-border">
              <Text className="text-foreground">Email</Text>
              <Text className="text-muted">{user.email}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-border">
              <Text className="text-foreground">Privacy Settings</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-border">
              <Text className="text-foreground">Notification Settings</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="mt-6 bg-error rounded-xl py-3"
            >
              <Text className="text-white text-center font-semibold">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
