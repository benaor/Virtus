/**
 * Home Screen
 * Dashboard with daily engagements and progress
 */

import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Accueil</Text>
      <Text className="text-gray-500 mt-2">Tableau de bord</Text>
    </View>
  );
}
