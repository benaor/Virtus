/**
 * Timeline Screen
 * 70-day journey progress and timeline
 */

import { View, Text } from 'react-native';

export default function TimelineScreen() {
  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Parcours</Text>
      <Text className="text-gray-500 mt-2">Timeline du parcours</Text>
    </View>
  );
}
