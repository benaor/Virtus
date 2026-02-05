/**
 * Formation Screen
 * Daily spiritual formation with reading and meditation
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDayStore } from '@presentation/stores/useDayStore';
import { useFormation } from '@presentation/hooks';
import { TOTAL_DAYS } from '@core/constants/parcours';

const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  goldBg: '#FDF8E8',
  background: '#FEFEFE',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  grayBg: '#F9FAFB',
  border: '#E5E7EB',
};

/**
 * Parse simple markdown to styled components
 * Handles: **bold**, *italic*, > blockquotes
 */
function FormattedText({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Check if it's a blockquote (biblical citation)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '');
          return (
            <View
              key={index}
              className="my-4 pl-4"
              style={{ borderLeftWidth: 3, borderLeftColor: COLORS.gold }}
            >
              <Text
                className="text-base leading-7"
                style={{
                  color: COLORS.textSecondary,
                  fontFamily: 'Georgia',
                  fontStyle: 'italic',
                }}
              >
                {quoteText}
              </Text>
            </View>
          );
        }

        // Regular paragraph
        return (
          <Text
            key={index}
            className="text-base leading-7 mb-4"
            style={{
              color: COLORS.textPrimary,
              fontFamily: 'Georgia',
            }}
          >
            {trimmed}
          </Text>
        );
      })}
    </>
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
      <Text
        className="mt-4 text-base"
        style={{ color: COLORS.textMuted }}
      >
        Chargement...
      </Text>
    </View>
  );
}

/**
 * No formation available state
 */
function NoFormationState() {
  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: COLORS.background }}
    >
      <Text className="text-4xl mb-4">📚</Text>
      <Text
        className="text-lg text-center"
        style={{ color: COLORS.textMuted }}
      >
        Aucune formation disponible pour ce jour
      </Text>
    </View>
  );
}

export default function FormationScreen() {
  const currentDay = useDayStore((state) => state.currentDay);
  const currentPeriod = useDayStore((state) => state.currentPeriod);

  // Allow navigating to different days
  const [viewingDay, setViewingDay] = useState<number | null>(null);
  const activeDay = viewingDay ?? currentDay ?? 1;

  const {
    formation,
    noteContent,
    isLoading,
    isSaving,
    updateNote,
  } = useFormation(activeDay);

  // Navigation handlers
  const canGoPrevious = activeDay > 1;
  const canGoNext = activeDay < TOTAL_DAYS && (currentDay === null || activeDay < currentDay);

  const goToPreviousDay = () => {
    if (canGoPrevious) {
      setViewingDay(activeDay - 1);
    }
  };

  const goToNextDay = () => {
    if (canGoNext) {
      setViewingDay(activeDay + 1);
    }
  };

  const goToToday = () => {
    setViewingDay(null);
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show no formation state
  if (!formation) {
    return <NoFormationState />;
  }

  const isViewingToday = viewingDay === null || viewingDay === currentDay;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        {/* Period label */}
        <Text
          className="text-xs tracking-widest mb-2"
          style={{ color: COLORS.gold }}
        >
          {currentPeriod?.name.toUpperCase() ?? 'PARCOURS'} · JOUR {activeDay}
        </Text>

        {/* Title */}
        <Text
          className="text-2xl mb-3"
          style={{
            color: COLORS.textPrimary,
            fontFamily: 'Georgia',
            fontWeight: '700',
            lineHeight: 32,
          }}
        >
          {formation.title}
        </Text>

        {/* Author and reading time */}
        <View className="flex-row items-center">
          <Text
            className="text-sm"
            style={{ color: COLORS.textMuted }}
          >
            {formation.author}
          </Text>
          <Text
            className="text-sm mx-2"
            style={{ color: COLORS.textMuted }}
          >
            ·
          </Text>
          <Feather name="clock" size={14} color={COLORS.textMuted} />
          <Text
            className="text-sm ml-1"
            style={{ color: COLORS.textMuted }}
          >
            {formation.readingTime} min
          </Text>
        </View>

        {/* Back to today button */}
        {!isViewingToday && currentDay !== null && (
          <Pressable
            className="flex-row items-center mt-3 py-2"
            onPress={goToToday}
          >
            <Feather name="arrow-left" size={14} color={COLORS.gold} />
            <Text
              className="text-sm ml-1"
              style={{ color: COLORS.gold }}
            >
              Retour au jour {currentDay}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Separator */}
      <View
        className="mx-6 h-px mb-6"
        style={{ backgroundColor: COLORS.border }}
      />

      {/* Formation body */}
      <View className="px-6">
        <FormattedText content={formation.body} />
      </View>

      {/* Meditation section */}
      <View className="px-6 mt-6">
        <View
          className="rounded-xl p-5"
          style={{ backgroundColor: COLORS.goldBg }}
        >
          <View className="flex-row items-center mb-3">
            <Text className="text-xl mr-2">🧘</Text>
            <Text
              className="text-base font-semibold"
              style={{ color: COLORS.gold }}
            >
              Texte pour la méditation
            </Text>
          </View>
          <Text
            className="text-base leading-7"
            style={{
              color: COLORS.gold,
              fontFamily: 'Georgia',
              fontStyle: 'italic',
            }}
          >
            {formation.meditationText}
          </Text>
        </View>
      </View>

      {/* Journal section */}
      <View className="px-6 mt-6">
        <View
          className="rounded-xl p-5"
          style={{ backgroundColor: COLORS.grayBg }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-xl mr-2">📝</Text>
              <Text
                className="text-base font-semibold"
                style={{ color: COLORS.textSecondary }}
              >
                Notes personnelles
              </Text>
            </View>
            {isSaving && (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color={COLORS.textMuted} />
                <Text
                  className="text-xs ml-1"
                  style={{ color: COLORS.textMuted }}
                >
                  Sauvegarde...
                </Text>
              </View>
            )}
          </View>
          <TextInput
            className="text-base p-3 rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              color: COLORS.textPrimary,
              minHeight: 120,
              textAlignVertical: 'top',
              fontFamily: 'Georgia',
            }}
            multiline
            placeholder="Écris tes réflexions, ce qui t'a touché..."
            placeholderTextColor={COLORS.textMuted}
            value={noteContent}
            onChangeText={updateNote}
          />
        </View>
      </View>

      {/* Day navigation */}
      <View className="px-6 mt-8 flex-row items-center justify-between">
        <Pressable
          className="flex-row items-center py-3 px-4 rounded-xl"
          style={{
            backgroundColor: canGoPrevious ? COLORS.grayBg : 'transparent',
            opacity: canGoPrevious ? 1 : 0.3,
          }}
          onPress={goToPreviousDay}
          disabled={!canGoPrevious}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={canGoPrevious ? COLORS.textSecondary : COLORS.textMuted}
          />
          <Text
            className="text-sm ml-1"
            style={{ color: canGoPrevious ? COLORS.textSecondary : COLORS.textMuted }}
          >
            Jour {activeDay - 1}
          </Text>
        </Pressable>

        <Text
          className="text-sm"
          style={{ color: COLORS.textMuted }}
        >
          {activeDay}/{TOTAL_DAYS}
        </Text>

        <Pressable
          className="flex-row items-center py-3 px-4 rounded-xl"
          style={{
            backgroundColor: canGoNext ? COLORS.grayBg : 'transparent',
            opacity: canGoNext ? 1 : 0.3,
          }}
          onPress={goToNextDay}
          disabled={!canGoNext}
        >
          <Text
            className="text-sm mr-1"
            style={{ color: canGoNext ? COLORS.textSecondary : COLORS.textMuted }}
          >
            Jour {activeDay + 1}
          </Text>
          <Feather
            name="chevron-right"
            size={20}
            color={canGoNext ? COLORS.textSecondary : COLORS.textMuted}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}
