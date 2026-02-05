/**
 * Examen Screen
 * Daily examination of conscience (modal)
 */

import { View, Text } from 'react-native';

export default function ExamenScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">Examen de conscience</Text>
      <Text className="text-gray-500 mt-2">5 étapes de l'examen quotidien</Text>
    </View>
  );
}
