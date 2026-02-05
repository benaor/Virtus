/**
 * Formation Screen
 * Daily spiritual formation content
 */

import { View, Text } from 'react-native';

export default function FormationScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Formation</Text>
      <Text className="text-gray-500 mt-2">Formation du jour</Text>
    </View>
  );
}
