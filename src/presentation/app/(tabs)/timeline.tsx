/**
 * Timeline Screen
 * 70-day journey progress with periods, weekly view, and upcoming events
 */

import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useDayStore } from '@presentation/stores/useDayStore';
import { useTimeline } from '@presentation/hooks';
import { PERIODS, TOTAL_DAYS, type Period } from '@core/constants/parcours';

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
  success: '#22C55E',
  white: '#FFFFFF',
};

// Upcoming liturgical events
const UPCOMING_EVENTS = [
  { icon: '✝', name: 'Mercredi des Cendres', date: '2026-02-18', display: '18 février' },
  { icon: '🕊', name: 'Dimanche des Rameaux', date: '2026-03-29', display: '29 mars' },
  { icon: '🕯', name: 'Semaine Sainte', date: '2026-03-30', display: '30 mars - 4 avril' },
  { icon: '☀️', name: 'Pâques', date: '2026-04-05', display: '5 avril' },
];

// Day labels (Monday first)
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Format a date for display (e.g., "16 fév - 4 mar")
 */
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T12:00:00Z');
  const end = new Date(endDate + 'T12:00:00Z');

  const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return `${startStr} - ${endStr}`;
}

/**
 * Calculate days remaining until a date
 */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T12:00:00Z');
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Period card component
 */
interface PeriodCardProps {
  period: Period;
  currentDay: number | null;
}

function PeriodCard({ period, currentDay }: PeriodCardProps) {
  const isActive = currentDay !== null &&
    currentDay >= period.startDay &&
    currentDay <= period.endDay;

  const isPast = currentDay !== null && currentDay > period.endDay;
  const isFuture = currentDay === null || currentDay < period.startDay;

  // Calculate progress within this period
  let progress = 0;
  if (isPast) {
    progress = 100;
  } else if (isActive && currentDay !== null) {
    const daysInPeriod = period.endDay - period.startDay + 1;
    const daysCompleted = currentDay - period.startDay;
    progress = Math.round((daysCompleted / daysInPeriod) * 100);
  }

  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: COLORS.white,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? COLORS.gold : COLORS.border,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text
            className="text-base font-semibold"
            style={{ color: isActive ? COLORS.gold : COLORS.textPrimary }}
          >
            {period.name}
          </Text>
          {isActive && (
            <View
              className="ml-2 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: COLORS.goldBg }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: COLORS.gold }}
              >
                EN COURS
              </Text>
            </View>
          )}
        </View>
        <Text
          className="text-sm"
          style={{ color: COLORS.textMuted }}
        >
          J{period.startDay}–J{period.endDay}
        </Text>
      </View>

      <Text
        className="text-xs mb-3"
        style={{ color: COLORS.textMuted }}
      >
        {formatDateRange(period.startDate, period.endDate)}
      </Text>

      {/* Progress bar */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: COLORS.grayLight }}
      >
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: isPast ? COLORS.success : COLORS.gold,
            width: `${progress}%`,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Weekly day circle component
 */
interface DayCircleProps {
  day: number;
  percentage: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
}

function DayCircle({ day, percentage, isPast, isToday, isFuture }: DayCircleProps) {
  let backgroundColor = COLORS.grayLight;
  let borderColor = 'transparent';
  let textColor = COLORS.textMuted;

  if (isToday) {
    backgroundColor = COLORS.white;
    borderColor = COLORS.gold;
    textColor = COLORS.gold;
  } else if (isPast) {
    if (percentage >= 100) {
      backgroundColor = COLORS.gold;
      textColor = COLORS.white;
    } else if (percentage > 0) {
      backgroundColor = COLORS.goldBg;
      textColor = COLORS.gold;
    } else {
      backgroundColor = COLORS.grayBg;
      textColor = COLORS.textMuted;
    }
  }

  return (
    <View
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{
        backgroundColor,
        borderWidth: isToday ? 2 : 0,
        borderColor,
        shadowColor: isToday ? COLORS.gold : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isToday ? 0.3 : 0,
        shadowRadius: 4,
        elevation: isToday ? 4 : 0,
      }}
    >
      <Text
        className="text-sm font-semibold"
        style={{ color: textColor }}
      >
        {day}
      </Text>
    </View>
  );
}

/**
 * Upcoming event row
 */
interface EventRowProps {
  icon: string;
  name: string;
  display: string;
  daysRemaining: number;
}

function EventRow({ icon, name, display, daysRemaining }: EventRowProps) {
  const isPast = daysRemaining < 0;
  const isToday = daysRemaining === 0;

  return (
    <View className="flex-row items-center py-3">
      <Text className="text-xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text
          className="text-base"
          style={{
            color: isPast ? COLORS.textMuted : COLORS.textPrimary,
            textDecorationLine: isPast ? 'line-through' : 'none',
          }}
        >
          {name}
        </Text>
        <Text
          className="text-sm"
          style={{ color: COLORS.textMuted }}
        >
          {display}
        </Text>
      </View>
      {!isPast && (
        <Text
          className="text-sm"
          style={{ color: isToday ? COLORS.gold : COLORS.textMuted }}
        >
          {isToday ? "Aujourd'hui" : `dans ${daysRemaining} j`}
        </Text>
      )}
    </View>
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

export default function TimelineScreen() {
  const currentDay = useDayStore((state) => state.currentDay);
  const { weekDays, weekNumber, isLoading } = useTimeline();

  if (isLoading) {
    return <LoadingState />;
  }

  // Reorder weekDays to start with Monday (dayOfWeek 1)
  // JavaScript's getDay() returns 0 for Sunday, 1 for Monday, etc.
  const orderedWeekDays = [...weekDays].sort((a, b) => {
    // Convert Sunday (0) to 7 for sorting
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

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
          Mon parcours
        </Text>
        <Text
          className="text-sm mt-1"
          style={{ color: COLORS.textMuted }}
        >
          {TOTAL_DAYS} jours pour se laisser transformer
        </Text>
      </View>

      {/* Periods */}
      <View className="px-6 mb-6">
        {PERIODS.map((period) => (
          <PeriodCard
            key={period.name}
            period={period}
            currentDay={currentDay}
          />
        ))}
      </View>

      {/* Current Week */}
      <View className="px-6 mb-6">
        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: COLORS.white }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-base font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              Semaine {weekNumber}
            </Text>
            <Text
              className="text-sm"
              style={{ color: COLORS.textMuted }}
            >
              {currentDay !== null ? `Jour ${currentDay}` : 'Hors parcours'}
            </Text>
          </View>

          {/* Day labels */}
          <View className="flex-row justify-around mb-2">
            {DAY_LABELS.map((label, index) => (
              <Text
                key={index}
                className="text-xs w-10 text-center"
                style={{ color: COLORS.textMuted }}
              >
                {label}
              </Text>
            ))}
          </View>

          {/* Day circles */}
          <View className="flex-row justify-around">
            {orderedWeekDays.length > 0 ? (
              orderedWeekDays.map((dayData) => (
                <DayCircle
                  key={dayData.day}
                  day={dayData.day}
                  percentage={dayData.percentage}
                  isPast={dayData.isPast}
                  isToday={dayData.isToday}
                  isFuture={dayData.isFuture}
                />
              ))
            ) : (
              DAY_LABELS.map((_, index) => (
                <View
                  key={index}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: COLORS.grayLight }}
                >
                  <Text
                    className="text-sm"
                    style={{ color: COLORS.textMuted }}
                  >
                    -
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Legend */}
          <View className="flex-row justify-center mt-4 gap-4">
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: COLORS.gold }}
              />
              <Text
                className="text-xs"
                style={{ color: COLORS.textMuted }}
              >
                100%
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: COLORS.goldBg }}
              />
              <Text
                className="text-xs"
                style={{ color: COLORS.textMuted }}
              >
                Partiel
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-1"
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.gold,
                }}
              />
              <Text
                className="text-xs"
                style={{ color: COLORS.textMuted }}
              >
                Aujourd'hui
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Upcoming Events */}
      <View className="px-6">
        <Text
          className="text-base font-semibold mb-3"
          style={{ color: COLORS.textPrimary }}
        >
          Temps forts à venir
        </Text>
        <View
          className="rounded-xl px-4"
          style={{ backgroundColor: COLORS.white }}
        >
          {UPCOMING_EVENTS.map((event, index) => (
            <View key={event.name}>
              <EventRow
                icon={event.icon}
                name={event.name}
                display={event.display}
                daysRemaining={daysUntil(event.date)}
              />
              {index < UPCOMING_EVENTS.length - 1 && (
                <View
                  className="h-px"
                  style={{ backgroundColor: COLORS.grayLight }}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
