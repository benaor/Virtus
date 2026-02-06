/**
 * LoadingScreen Component
 * Displayed while the app initializes (DB, onboarding check)
 */

import { View, Text, ActivityIndicator } from 'react-native';

const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  background: '#FAF6EB',
  textPrimary: '#1F2937',
};

export function LoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Logo */}
      <View className="items-center mb-8">
        {/* Cross */}
        <Text
          className="text-5xl mb-4"
          style={{ color: COLORS.gold }}
        >
          ✝
        </Text>

        {/* App Name */}
        <Text
          className="text-4xl tracking-widest"
          style={{
            color: COLORS.gold,
            fontFamily: 'Georgia',
            fontWeight: '700',
          }}
        >
          VIRTUS
        </Text>
      </View>

      {/* Spinner */}
      <ActivityIndicator size="large" color={COLORS.goldLight} />
    </View>
  );
}
