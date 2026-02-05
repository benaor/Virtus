/**
 * Bilan Screen
 * Statistics and overall progress
 */

import { View, Text } from 'react-native';

export default function BilanScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Bilan</Text>
      <Text className="text-gray-500 mt-2">Statistiques</Text>
    </View>
  );
}
