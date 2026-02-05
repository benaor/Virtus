/**
 * Welcome Screen
 * First screen of the onboarding flow
 */

import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/penance');
  };

  return (
    <View className="flex-1 bg-white px-6 py-12 justify-center items-center">
      <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
        Bienvenue sur Virtus
      </Text>
      <Text className="text-lg text-gray-600 text-center mb-12 px-4">
        70 jours pour grandir en vertu et en sainteté. Prêt à commencer ce beau parcours ?
      </Text>
      <Pressable
        className="bg-blue-600 px-8 py-4 rounded-xl flex-row items-center"
        onPress={handleContinue}
      >
        <Text className="text-white text-lg font-semibold mr-2">Commencer</Text>
        <Feather name="arrow-right" size={20} color="white" />
      </Pressable>
    </View>
  );
}
