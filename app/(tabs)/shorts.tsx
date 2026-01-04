import { View, Text } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';

export default function ShortsScreen() {
  return (
    <ScreenContainer className="justify-center items-center px-6">
      <Text className="text-2xl font-bold text-foreground mb-2">Shorts</Text>
      <Text className="text-muted text-center">
        Short-form vertical videos coming soon
      </Text>
    </ScreenContainer>
  );
}
