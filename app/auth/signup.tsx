import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import * as Haptics from 'expo-haptics';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useSupabaseAuth();

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error } = await signUp(email, password, username);

    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6">
            {/* Logo/Title */}
            <View className="items-center mb-12">
              <Text className="text-4xl font-bold text-foreground mb-2">
                Create Account
              </Text>
              <Text className="text-base text-muted">Join Digital Self Social</Text>
            </View>

            {/* Username Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Username</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Choose a username"
                placeholderTextColor="#9BA1A6"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Enter your email"
                placeholderTextColor="#9BA1A6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Create a password"
                placeholderTextColor="#9BA1A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">
                Confirm Password
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Confirm your password"
                placeholderTextColor="#9BA1A6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="bg-primary rounded-xl py-4 mb-6"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View className="flex-row justify-center">
              <Text className="text-muted text-sm">Already have an account? </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text className="text-primary text-sm font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
