/**
 * Bilan Screen
 * Weekly/overall stats, heatmap, encouragement, and confession tracking
 */

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useBilan } from '@presentation/hooks';
import type { EngagementCategory } from '@domain/entities';

const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  goldBg: '#FDF8E8',
  background: '#FAFAFA',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  grayBg: '#F3F4F6',
  grayLight: '#E5E7EB',
  border: '#E5E7EB',
  white: '#FFFFFF',
  // Category colors
  spiritual: '#8B6914',
  virtue: '#6B8E23',
  penance: '#8B4513',
  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const CATEGORY_LABELS: Record<EngagementCategory, string> = {
  spiritual: 'Spirituel',
  virtue: 'Vertu',
  penance: 'Pénitence',
};

const CATEGORY_ICONS: Record<EngagementCategory, string> = {
  spiritual: '🙏',
  virtue: '💪',
  penance: '⚔️',
};

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Stats card for a category
 */
interface StatCardProps {
  category: EngagementCategory;
  percentage: number;
}

function StatCard({ category, percentage }: StatCardProps) {
  const color = COLORS[category];

  return (
    <View
      className="flex-1 rounded-xl p-4"
      style={{ backgroundColor: COLORS.white }}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-lg mr-2">{CATEGORY_ICONS[category]}</Text>
        <Text
          className="text-sm font-medium"
          style={{ color: COLORS.textSecondary }}
        >
          {CATEGORY_LABELS[category]}
        </Text>
      </View>

      {/* Percentage */}
      <Text
        className="text-2xl font-bold mb-2"
        style={{ color }}
      >
        {percentage}%
      </Text>

      {/* Progress bar */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: COLORS.grayLight }}
      >
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: `${percentage}%`,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Heatmap cell
 */
interface HeatmapCellProps {
  checked: boolean;
  category: EngagementCategory;
}

function HeatmapCell({ checked, category }: HeatmapCellProps) {
  const color = COLORS[category];

  return (
    <View
      className="w-6 h-6 rounded-sm mx-0.5"
      style={{
        backgroundColor: checked ? color : COLORS.grayLight,
        opacity: checked ? 1 : 0.3,
      }}
    />
  );
}

/**
 * Heatmap row for an engagement
 */
interface HeatmapRowProps {
  name: string;
  category: EngagementCategory;
  days: boolean[];
}

function HeatmapRow({ name, category, days }: HeatmapRowProps) {
  return (
    <View className="flex-row items-center py-2">
      <View className="flex-1 pr-2">
        <Text
          className="text-xs"
          style={{ color: COLORS.textSecondary }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      <View className="flex-row">
        {days.map((checked, index) => (
          <HeatmapCell key={index} checked={checked} category={category} />
        ))}
      </View>
    </View>
  );
}

/**
 * Encouragement card
 */
interface EncouragementCardProps {
  emoji: string;
  message: string;
}

function EncouragementCard({ emoji, message }: EncouragementCardProps) {
  return (
    <View
      className="rounded-xl p-4"
      style={{
        backgroundColor: COLORS.goldBg,
        borderWidth: 1,
        borderColor: COLORS.goldLight,
      }}
    >
      <View className="flex-row items-start">
        <Text className="text-3xl mr-3">{emoji}</Text>
        <View className="flex-1">
          <Text
            className="text-sm leading-5"
            style={{
              color: COLORS.textPrimary,
              fontFamily: 'Georgia',
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Confession card
 */
interface ConfessionCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  isWarning?: boolean;
  onPress?: () => void;
}

function ConfessionCard({ title, value, subtitle, icon, isWarning, onPress }: ConfessionCardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      className="flex-1 rounded-xl p-4"
      style={{
        backgroundColor: COLORS.white,
        borderWidth: isWarning ? 1 : 0,
        borderColor: isWarning ? COLORS.warning : 'transparent',
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-2xl mb-2">{icon}</Text>
      <Text
        className="text-xs font-medium mb-1"
        style={{ color: COLORS.textMuted }}
      >
        {title}
      </Text>
      <Text
        className="text-xl font-bold mb-1"
        style={{ color: isWarning ? COLORS.warning : COLORS.textPrimary }}
      >
        {value}
      </Text>
      <Text
        className="text-xs"
        style={{ color: COLORS.textMuted }}
      >
        {subtitle}
      </Text>
    </CardWrapper>
  );
}

/**
 * Loading state
 */
function LoadingState() {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: COLORS.background }}
    >
      <ActivityIndicator size="large" color={COLORS.gold} />
    </View>
  );
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z');
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export default function BilanScreen() {
  const {
    overallStats,
    weeklyStats,
    encouragement,
    confession,
    currentDay,
    isLoading,
    recordConfession,
  } = useBilan();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View className="px-6 pt-6 pb-4">
        <Text
          className="text-2xl"
          style={{
            color: COLORS.textPrimary,
            fontFamily: 'Georgia',
            fontWeight: '700',
          }}
        >
          Mon bilan
        </Text>
        <Text
          className="text-sm mt-1"
          style={{ color: COLORS.textMuted }}
        >
          {currentDay !== null
            ? `Jour ${currentDay} de ton parcours`
            : 'Parcours non commencé'}
        </Text>
      </View>

      {/* Stats Cards */}
      {overallStats && (
        <View className="px-6 mb-6">
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: COLORS.textPrimary }}
          >
            Fidélité globale
          </Text>
          <View className="flex-row gap-3">
            <StatCard category="spiritual" percentage={overallStats.spiritual} />
            <StatCard category="virtue" percentage={overallStats.virtue} />
            <StatCard category="penance" percentage={overallStats.penance} />
          </View>
        </View>
      )}

      {/* Encouragement */}
      {encouragement && (
        <View className="px-6 mb-6">
          <EncouragementCard
            emoji={encouragement.emoji}
            message={encouragement.message}
          />
        </View>
      )}

      {/* Weekly Heatmap */}
      {weeklyStats.length > 0 && (
        <View className="px-6 mb-6">
          <Text
            className="text-base font-semibold mb-3"
            style={{ color: COLORS.textPrimary }}
          >
            Cette semaine
          </Text>
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: COLORS.white }}
          >
            {/* Day headers */}
            <View className="flex-row items-center pb-2 mb-2 border-b" style={{ borderColor: COLORS.grayLight }}>
              <View className="flex-1" />
              <View className="flex-row">
                {DAY_LABELS.map((label, index) => (
                  <View key={index} className="w-6 mx-0.5 items-center">
                    <Text
                      className="text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Engagement rows */}
            {weeklyStats.map((stat) => (
              <HeatmapRow
                key={stat.engagement.id}
                name={stat.engagement.title}
                category={stat.engagement.category}
                days={stat.days}
              />
            ))}

            {/* Legend */}
            <View className="flex-row justify-center mt-4 pt-3 border-t" style={{ borderColor: COLORS.grayLight }}>
              {(['spiritual', 'virtue', 'penance'] as EngagementCategory[]).map((category) => (
                <View key={category} className="flex-row items-center mx-2">
                  <View
                    className="w-3 h-3 rounded-sm mr-1"
                    style={{ backgroundColor: COLORS[category] }}
                  />
                  <Text
                    className="text-xs"
                    style={{ color: COLORS.textMuted }}
                  >
                    {CATEGORY_LABELS[category]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Confession Tracking */}
      <View className="px-6 mb-6">
        <Text
          className="text-base font-semibold mb-3"
          style={{ color: COLORS.textPrimary }}
        >
          Confession
        </Text>
        <View className="flex-row gap-3">
          <ConfessionCard
            icon="⛪"
            title="Dernière confession"
            value={confession.lastDate ? formatDate(confession.lastDate) : '-'}
            subtitle={
              confession.daysSince !== null
                ? `Il y a ${confession.daysSince} jour${confession.daysSince > 1 ? 's' : ''}`
                : 'Non renseignée'
            }
            onPress={() => recordConfession()}
          />
          <ConfessionCard
            icon="📅"
            title="Prochain objectif"
            value={
              confession.daysUntilGoal !== null
                ? confession.daysUntilGoal > 0
                  ? `${confession.daysUntilGoal}j`
                  : 'Maintenant'
                : `${confession.goalDays}j`
            }
            subtitle={`Objectif : tous les ${confession.goalDays} jours`}
            isWarning={confession.isOverdue}
          />
        </View>
        <TouchableOpacity
          className="mt-3 py-3 rounded-xl items-center"
          style={{ backgroundColor: COLORS.goldBg }}
          onPress={() => recordConfession()}
          activeOpacity={0.7}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: COLORS.gold }}
          >
            Je me suis confessé(e) aujourd'hui
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overall average */}
      {overallStats && (
        <View className="px-6">
          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: COLORS.white }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base"
                style={{ color: COLORS.textSecondary }}
              >
                Moyenne générale
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: COLORS.gold }}
              >
                {Math.round((overallStats.spiritual + overallStats.virtue + overallStats.penance) / 3)}%
              </Text>
            </View>
            <View
              className="h-3 rounded-full overflow-hidden mt-3"
              style={{ backgroundColor: COLORS.grayLight }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: COLORS.gold,
                  width: `${Math.round((overallStats.spiritual + overallStats.virtue + overallStats.penance) / 3)}%`,
                }}
              />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
