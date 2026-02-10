/**
 * Home Screen
 * Dashboard with daily engagements, progress, and exhortation
 */

import { useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDayStore } from '@presentation/stores/useDayStore';
import { useHomeData } from '@presentation/hooks';
import { EngagementChecklist, ExhortationCard } from '@presentation/components';
import type { EngagementCategory, CategoryProgress } from '@domain/entities';
import { PARCOURS_START, TOTAL_DAYS } from '@core/constants/parcours';
import { FEATURE_FLAGS } from '@core/constants';

const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  background: '#FAFAFA',
  textPrimary: '#111827',
  textMuted: '#6B7280',
};

// Category configuration
const CATEGORIES: {
  key: EngagementCategory;
  label: string;
  emoji: string;
}[] = [
  { key: 'spiritual', label: 'Vie spirituelle', emoji: '🙏' },
  { key: 'virtue', label: 'Vertu', emoji: '🤲' },
  { key: 'penance', label: 'Pénitence', emoji: '😇' },
];

/**
 * Circular progress indicator with animation
 */
function ProgressCircle({ day, total }: { day: number; total: number }) {
  const percentage = (day / total) * 100;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animate rotation based on percentage (0-360 degrees mapped from 0-100%)
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: percentage,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [percentage, rotateAnim, scaleAnim]);

  return (
    <Animated.View
      className="w-20 h-20 items-center justify-center"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      {/* Background circle */}
      <View
        className="absolute w-20 h-20 rounded-full"
        style={{ borderWidth: 4, borderColor: '#E5E7EB' }}
      />
      {/* Progress arc (simulated with border) */}
      <View
        className="absolute w-20 h-20 rounded-full"
        style={{
          borderWidth: 4,
          borderColor: COLORS.gold,
          borderTopColor: percentage > 25 ? COLORS.gold : 'transparent',
          borderRightColor: percentage > 50 ? COLORS.gold : 'transparent',
          borderBottomColor: percentage > 75 ? COLORS.gold : 'transparent',
          borderLeftColor: percentage > 0 ? COLORS.gold : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {/* Center text */}
      <View className="items-center">
        <Text
          className="text-lg font-bold"
          style={{ color: COLORS.gold }}
        >
          {day}
        </Text>
        <Text
          className="text-xs"
          style={{ color: COLORS.textMuted }}
        >
          /{total}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Waiting screen when outside parcours period
 */
function WaitingScreen() {
  const startDate = new Date(PARCOURS_START + 'T00:00:00');
  const formattedDate = startDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: COLORS.background }}
    >
      <Text className="text-6xl mb-6">⏳</Text>
      <Text
        className="text-2xl text-center mb-4"
        style={{
          color: COLORS.gold,
          fontFamily: 'Georgia',
          fontWeight: '700',
        }}
      >
        Le parcours Virtus{'\n'}commence bientôt
      </Text>
      <Text
        className="text-lg text-center mb-8"
        style={{ color: COLORS.textMuted }}
      >
        Rendez-vous le {formattedDate}
      </Text>
      <View
        className="px-6 py-3 rounded-xl"
        style={{ backgroundColor: '#FDF8E8' }}
      >
        <Text
          className="text-base text-center"
          style={{
            color: COLORS.gold,
            fontFamily: 'Georgia',
            fontStyle: 'italic',
          }}
        >
          Prépare ton cœur à cette belle aventure.
        </Text>
      </View>
    </View>
  );
}

/**
 * Loading screen
 */
function LoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: COLORS.background }}
    >
      <ActivityIndicator size="large" color={COLORS.gold} />
      <Text
        className="mt-4 text-base"
        style={{ color: COLORS.textMuted }}
      >
        Chargement...
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const currentDay = useDayStore((state) => state.currentDay);
  const currentPeriod = useDayStore((state) => state.currentPeriod);

  const {
    engagements,
    checks,
    exhortation,
    progress,
    isLoading,
    toggleEngagement,
  } = useHomeData();

  // Check if it's evening (after 20h)
  const isEvening = useMemo(() => {
    const now = new Date();
    return now.getHours() >= 20;
  }, []);

  // Group engagements by category
  const engagementsByCategory = useMemo(() => {
    const grouped: Record<EngagementCategory, typeof engagements> = {
      spiritual: [],
      virtue: [],
      penance: [],
    };
    engagements.forEach((e) => {
      grouped[e.category].push(e);
    });
    return grouped;
  }, [engagements]);

  // Get progress by category
  const getProgressForCategory = (category: EngagementCategory): CategoryProgress => {
    if (!progress) {
      return { category, checked: 0, total: 0, percentage: 0 };
    }
    return progress[category];
  };

  // Handle navigation to formation
  const handleReadMore = () => {
    router.push('/formation');
  };

  // Handle examen navigation
  const handleExamen = () => {
    router.push('/examen');
  };

  // Show waiting screen if outside parcours
  if (currentDay === null) {
    return <WaitingScreen />;
  }

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Format day label (e.g., "Mardi de la 2ᵉ semaine")
  const dayOfWeek = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  const weekNumber = Math.ceil(currentDay / 7);
  const weekSuffix = weekNumber === 1 ? 'ʳᵉ' : 'ᵉ';
  const dayLabel = `${capitalizedDay} de la ${weekNumber}${weekSuffix} semaine`;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-5 pt-4 pb-6 flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          {/* Period label */}
          <Text
            className="text-xs tracking-widest mb-1"
            style={{ color: COLORS.gold }}
          >
            {currentPeriod?.name.toUpperCase()} · JOUR {currentDay}
          </Text>
          {/* Day title */}
          <Text
            className="text-xl"
            style={{
              color: COLORS.textPrimary,
              fontFamily: 'Georgia',
              fontWeight: '600',
            }}
          >
            {dayLabel}
          </Text>
        </View>
        {/* Progress circle */}
        <ProgressCircle day={currentDay} total={TOTAL_DAYS} />
      </View>

      {/* Exhortation Card */}
      <View className="px-5 mb-6">
        <ExhortationCard
          exhortation={exhortation}
          onReadMore={FEATURE_FLAGS.formation ? handleReadMore : undefined}
        />
      </View>

      {/* Engagement Checklists */}
      <View className="px-5">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <EngagementChecklist
            key={key}
            category={key}
            label={label}
            emoji={emoji}
            engagements={engagementsByCategory[key]}
            checks={checks}
            progress={getProgressForCategory(key)}
            onToggle={toggleEngagement}
          />
        ))}
      </View>

      {/* Examen Button */}
      <View className="px-5 mt-4">
        <Pressable
          className="flex-row items-center justify-center py-4 rounded-xl"
          style={{
            backgroundColor: isEvening ? COLORS.gold : '#F3F4F6',
            borderWidth: isEvening ? 0 : 1,
            borderColor: '#E5E7EB',
          }}
          onPress={handleExamen}
        >
          <Feather
            name="moon"
            size={20}
            color={isEvening ? '#FFFFFF' : COLORS.textMuted}
          />
          <Text
            className="text-base font-semibold ml-2"
            style={{
              color: isEvening ? '#FFFFFF' : COLORS.textMuted,
            }}
          >
            Examen de conscience
          </Text>
          {isEvening && (
            <View
              className="ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className="text-xs text-white">Recommandé</Text>
            </View>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
