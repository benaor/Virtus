/**
 * Index Screen
 * Redirects to appropriate screen based on onboarding status
 * The actual redirect logic is handled in _layout.tsx
 */

import { View, Text } from 'react-native';

export default function IndexScreen() {
  // This screen is just a placeholder while _layout.tsx handles the redirect
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-gray-500 text-lg">Chargement...</Text>
    </View>
  );
}
