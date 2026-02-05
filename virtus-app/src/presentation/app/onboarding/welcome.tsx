/**
 * Welcome Screen
 * First screen of the onboarding flow
 * Sober and warm design with golden accents
 */

import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';

// Golden palette
const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  background: '#FDFCFA',
  textMuted: '#6B7280',
};

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/onboarding/penance');
  };

  const handleAbout = () => {
    Alert.alert(
      'À propos du parcours',
      'Virtus est un parcours de Carême de 70 jours proposé par la Fraternité Saint-Vincent-Ferrier.\n\nPrière, vertu et pénitence : trois piliers pour se laisser transformer par la grâce.',
      [
        { text: 'Fermer', style: 'cancel' },
        {
          text: 'Visiter le site',
          onPress: () => Linking.openURL('https://caremevirtus.fr'),
        },
      ]
    );
  };

  return (
    <View className="flex-1 px-8 justify-center items-center" style={{ backgroundColor: COLORS.background }}>
      {/* Logo Section */}
      <View className="items-center mb-12">
        {/* Cross */}
        <Text
          className="text-4xl mb-2"
          style={{ color: COLORS.gold }}
        >
          ✝
        </Text>

        {/* VIRTUS Logo */}
        <Text
          className="text-5xl tracking-widest"
          style={{
            color: COLORS.gold,
            fontFamily: 'Georgia',
            fontWeight: '700',
          }}
        >
          VIRTUS
        </Text>
      </View>

      {/* Subtitle */}
      <Text
        className="text-xl text-center leading-7 mb-6 px-4"
        style={{
          color: COLORS.gold,
          fontFamily: 'Georgia',
        }}
      >
        Un grand carême de 70 jours{'\n'}pour se laisser transformer par Dieu
      </Text>

      {/* Pillars */}
      <Text
        className="text-base tracking-wider mb-16"
        style={{ color: COLORS.textMuted }}
      >
        Prière · Vertu · Pénitence
      </Text>

      {/* Primary Button */}
      <Pressable
        className="w-full py-4 rounded-xl items-center mb-4"
        style={{ backgroundColor: COLORS.gold }}
        onPress={handleStart}
      >
        <Text
          className="text-lg"
          style={{
            color: '#FFFFFF',
            fontFamily: 'Georgia',
            fontWeight: '600',
          }}
        >
          Commencer le parcours
        </Text>
      </Pressable>

      {/* Secondary Link */}
      <Pressable
        className="py-3"
        onPress={handleAbout}
      >
        <Text
          className="text-base"
          style={{ color: COLORS.goldLight }}
        >
          À propos du parcours
        </Text>
      </Pressable>
    </View>
  );
}
