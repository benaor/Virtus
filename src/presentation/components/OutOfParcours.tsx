/**
 * OutOfParcours Component
 * Displays appropriate screen when outside the parcours period
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  isBeforeParcours,
  isAfterParcours,
  getDaysUntilStart,
} from '@domain/entities/Parcours';

const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  goldBg: '#FDF8E8',
  background: '#FAF6EB',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  white: '#FFFFFF',
};

interface OutOfParcoursProps {
  today?: Date;
}

/**
 * Before Parcours Screen
 * Shows countdown and preparation option
 */
function BeforeParcoursScreen() {
  const router = useRouter();
  const today = new Date();
  const daysUntil = getDaysUntilStart(today);

  const handlePrepare = () => {
    router.push('/onboarding/welcome');
  };

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Cross Icon */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-8"
        style={{ backgroundColor: COLORS.goldBg }}
      >
        <Text className="text-4xl">✝</Text>
      </View>

      {/* Countdown */}
      <Text
        className="text-5xl font-bold mb-2"
        style={{ color: COLORS.gold }}
      >
        {daysUntil}
      </Text>
      <Text
        className="text-lg mb-8"
        style={{ color: COLORS.textSecondary }}
      >
        {daysUntil === 1 ? 'jour' : 'jours'}
      </Text>

      {/* Message */}
      <Text
        className="text-xl text-center mb-4"
        style={{
          color: COLORS.textPrimary,
          fontFamily: 'Georgia',
          fontWeight: '600',
        }}
      >
        Le parcours Virtus commence dans {daysUntil} jour{daysUntil === 1 ? '' : 's'}
      </Text>

      {/* Date info */}
      <View
        className="px-6 py-3 rounded-xl mb-10"
        style={{ backgroundColor: COLORS.goldBg }}
      >
        <Text
          className="text-sm text-center"
          style={{
            color: COLORS.gold,
            fontFamily: 'Georgia',
            fontStyle: 'italic',
          }}
        >
          1er février 2026 — Dimanche de la Septuagésime
        </Text>
      </View>

      {/* Prepare Button */}
      <TouchableOpacity
        className="flex-row items-center px-8 py-4 rounded-xl"
        style={{ backgroundColor: COLORS.gold }}
        onPress={handlePrepare}
        activeOpacity={0.8}
      >
        <Text
          className="text-base mr-2"
          style={{
            color: COLORS.white,
            fontFamily: 'Georgia',
            fontWeight: '600',
          }}
        >
          Préparer mes engagements
        </Text>
        <Feather name="arrow-right" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * After Parcours Screen
 * Shows conclusion message and bilan access
 */
function AfterParcoursScreen() {
  const router = useRouter();

  const handleViewBilan = () => {
    router.push('/(tabs)/bilan');
  };

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Victory Icon */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-8"
        style={{ backgroundColor: COLORS.goldBg }}
      >
        <Text className="text-4xl">🏆</Text>
      </View>

      {/* Title */}
      <Text
        className="text-2xl text-center mb-4"
        style={{
          color: COLORS.gold,
          fontFamily: 'Georgia',
          fontWeight: '700',
        }}
      >
        Le parcours Virtus est terminé !
      </Text>

      {/* Message */}
      <View
        className="px-6 py-4 rounded-xl mb-10"
        style={{ backgroundColor: COLORS.goldBg }}
      >
        <Text
          className="text-base text-center leading-6"
          style={{
            color: COLORS.textPrimary,
            fontFamily: 'Georgia',
            fontStyle: 'italic',
          }}
        >
          Que les grâces reçues{'\n'}portent du fruit toute l'année.
        </Text>
      </View>

      {/* Bilan Button */}
      <TouchableOpacity
        className="flex-row items-center px-8 py-4 rounded-xl"
        style={{ backgroundColor: COLORS.gold }}
        onPress={handleViewBilan}
        activeOpacity={0.8}
      >
        <Text
          className="text-base mr-2"
          style={{
            color: COLORS.white,
            fontFamily: 'Georgia',
            fontWeight: '600',
          }}
        >
          Voir mon bilan
        </Text>
        <Feather name="bar-chart-2" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Main OutOfParcours Component
 * Determines which screen to show based on current date
 */
export function OutOfParcours({ today = new Date() }: OutOfParcoursProps) {
  if (isBeforeParcours(today)) {
    return <BeforeParcoursScreen />;
  }

  if (isAfterParcours(today)) {
    return <AfterParcoursScreen />;
  }

  // Should not reach here if used correctly
  return null;
}
