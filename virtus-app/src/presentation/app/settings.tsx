/**
 * Settings Screen
 * App settings and preferences (modal)
 */

import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Réglages</Text>
      <Text className="text-gray-500 mt-2">Paramètres de l'application</Text>
    </View>
  );
}
