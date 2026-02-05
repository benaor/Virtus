/**
 * Penance Screen
 * Choose 5 personal penance engagements
 */

import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function PenanceScreen() {
  const router = useRouter();

  const handleFinish = () => {
    // TODO: Save penance engagements and complete onboarding
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white px-6 py-12">
      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
        Vos pénitences personnelles
      </Text>
      <Text className="text-base text-gray-600 text-center mb-8">
        Choisissez 5 engagements de pénitence pour ce parcours
      </Text>

      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 text-lg">Écran Pénitences</Text>
        <Text className="text-gray-400 text-lg">(Formulaire à implémenter)</Text>
      </View>

      <Pressable
        className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center justify-center mb-8"
        onPress={handleFinish}
      >
        <Text className="text-white text-lg font-semibold mr-2">Terminer</Text>
        <Feather name="check" size={20} color="white" />
      </Pressable>
    </View>
  );
}
