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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple } = useSupabaseAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { error } = await signInWithGoogle();
    if (error) {
      Alert.alert('Google Login Failed', error.message);
    }
  };

  const handleAppleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { error } = await signInWithApple();
    if (error) {
      Alert.alert('Apple Login Failed', error.message);
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
            <View className="items-center mb-12">
              <Text className="text-4xl font-bold text-foreground mb-2">
                Digital Self Social
              </Text>
              <Text className="text-base text-muted">Sign in to continue</Text>
            </View>

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

            <View className="mb-6">
              <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Enter your password"
                placeholderTextColor="#9BA1A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password' as any)}
              className="mb-6"
              disabled={loading}
            >
              <Text className="text-primary text-sm text-right">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary rounded-xl py-4 mb-4 active:opacity-90"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-center font-semibold text-base">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-muted text-sm">or continue with</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <View className="flex-row gap-4 mb-6">
              <TouchableOpacity
                onPress={handleGoogleLogin}
                disabled={loading}
                className="flex-1 bg-surface border border-border rounded-xl py-3 items-center active:opacity-70"
              >
                <Text className="text-foreground font-medium">Google</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={handleAppleLogin}
                  disabled={loading}
                  className="flex-1 bg-surface border border-border rounded-xl py-3 items-center active:opacity-70"
                >
                  <Text className="text-foreground font-medium">Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row justify-center">
              <Text className="text-muted text-sm">Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/signup' as any)}
                disabled={loading}
              >
                <Text className="text-primary text-sm font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
