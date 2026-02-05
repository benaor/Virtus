/**
 * ExhortationCard Component
 * Displays the daily exhortation with a golden gradient background
 */

import { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import type { Exhortation } from '@domain/entities';

const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  gradientStart: '#FFFBEB', // amber-50
  gradientEnd: '#FEF3C7',   // amber-100
  textMuted: '#6B7280',
};

interface ExhortationCardProps {
  /** The exhortation to display, or null for placeholder */
  exhortation: Exhortation | null;
  /** Callback when "Lire la suite" is pressed */
  onReadMore: () => void;
}

export function ExhortationCard({ exhortation, onReadMore }: ExhortationCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in when exhortation content loads
  useEffect(() => {
    if (exhortation) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [exhortation, fadeAnim]);

  if (!exhortation) {
    return (
      <View
        className="rounded-2xl p-5"
        style={{ backgroundColor: COLORS.gradientStart }}
      >
        <Text
          className="text-xs tracking-widest mb-3"
          style={{ color: COLORS.goldLight }}
        >
          📖 EXHORTATION DU JOUR
        </Text>
        <Text
          className="text-base text-center py-4"
          style={{ color: COLORS.textMuted }}
        >
          Aucune exhortation disponible
        </Text>
      </View>
    );
  }

  // Strip markdown and truncate for preview
  const plainText = exhortation.content
    .replace(/[#*_`~\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  return (
    <Pressable onPress={onReadMore}>
      <Animated.View
        className="rounded-2xl p-5"
        style={{
          backgroundColor: COLORS.gradientStart,
          // Simulated gradient with border
          borderBottomWidth: 3,
          borderBottomColor: COLORS.gradientEnd,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        }}
      >
        {/* Label */}
        <Text
          className="text-xs tracking-widest mb-3"
          style={{ color: COLORS.gold }}
        >
          📖 EXHORTATION DU JOUR
        </Text>

        {/* Exhortation text - italic, serif, 3 lines max */}
        <Text
          className="text-base leading-6 mb-4"
          numberOfLines={3}
          style={{
            color: '#374151',
            fontFamily: 'Georgia',
            fontStyle: 'italic',
          }}
        >
          « {plainText} »
        </Text>

        {/* Footer: Author + Read more */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-sm"
            style={{ color: COLORS.textMuted }}
          >
            — {exhortation.author}
          </Text>
          <Text
            className="text-sm"
            style={{ color: COLORS.goldLight }}
          >
            Lire la suite →
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
