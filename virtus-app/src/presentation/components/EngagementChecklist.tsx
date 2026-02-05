/**
 * EngagementChecklist Component
 * Reusable checklist for a category of engagements
 */

import { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import type { Engagement, EngagementCategory, CategoryProgress } from '@domain/entities';

// Category colors
const CATEGORY_COLORS: Record<EngagementCategory, string> = {
  spiritual: '#8B6914', // Golden
  virtue: '#6B8E23',    // Olive green
  penance: '#8B4513',   // Brown
};

// Lighter background colors for checked state
const CATEGORY_BG_COLORS: Record<EngagementCategory, string> = {
  spiritual: '#FDF8E8',
  virtue: '#F4F7ED',
  penance: '#FAF5F0',
};

interface EngagementChecklistProps {
  /** The category of engagements */
  category: EngagementCategory;
  /** Display label (e.g., "Vie spirituelle") */
  label: string;
  /** Emoji for the category (e.g., "🙏") */
  emoji: string;
  /** List of engagements to display */
  engagements: Engagement[];
  /** Map of engagement ID to checked state */
  checks: Map<string, boolean>;
  /** Progress stats for this category */
  progress: CategoryProgress;
  /** Callback when an engagement is toggled */
  onToggle: (engagementId: string) => void;
}

interface EngagementItemProps {
  engagement: Engagement;
  isChecked: boolean;
  color: string;
  onToggle: () => void;
}

function EngagementItem({ engagement, isChecked, color, onToggle }: EngagementItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Scale bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggle();
  };

  return (
    <Pressable
      className="flex-row items-center py-3 px-2"
      onPress={handlePress}
    >
      {/* Checkbox circle */}
      <Animated.View
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-4"
          style={{
            backgroundColor: isChecked ? color : 'transparent',
            borderWidth: isChecked ? 0 : 2,
            borderColor: '#D1D5DB',
          }}
        >
          {isChecked && (
            <Text className="text-white text-sm font-bold">✓</Text>
          )}
        </View>
      </Animated.View>

      {/* Engagement title */}
      <Text
        className="flex-1 text-base"
        style={{
          color: isChecked ? '#9CA3AF' : '#374151',
          textDecorationLine: isChecked ? 'line-through' : 'none',
        }}
      >
        {engagement.title}
      </Text>
    </Pressable>
  );
}

export function EngagementChecklist({
  category,
  label,
  emoji,
  engagements,
  checks,
  progress,
  onToggle,
}: EngagementChecklistProps) {
  const color = CATEGORY_COLORS[category];
  const bgColor = CATEGORY_BG_COLORS[category];

  return (
    <View className="mb-6">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 rounded-t-xl"
        style={{ backgroundColor: bgColor }}
      >
        <View className="flex-row items-center">
          <Text className="text-xl mr-2">{emoji}</Text>
          <Text
            className="text-lg font-semibold"
            style={{ color }}
          >
            {label}
          </Text>
        </View>
        <Text
          className="text-base font-semibold"
          style={{ color }}
        >
          {progress.checked}/{progress.total}
        </Text>
      </View>

      {/* Engagement list */}
      <View
        className="px-2 rounded-b-xl"
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: '#E5E7EB',
        }}
      >
        {engagements.map((engagement, index) => (
          <View key={engagement.id}>
            <EngagementItem
              engagement={engagement}
              isChecked={checks.get(engagement.id) ?? false}
              color={color}
              onToggle={() => onToggle(engagement.id)}
            />
            {index < engagements.length - 1 && (
              <View
                className="h-px mx-2"
                style={{ backgroundColor: '#F3F4F6' }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
