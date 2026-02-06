/**
 * Penance Edit Screen (Modal)
 * Edit the 5 personal penance engagements
 */

import { View, Text, Pressable, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePenanceEdit } from '@presentation/hooks';

// Golden palette (same as welcome screen)
const COLORS = {
  gold: '#8B6914',
  goldLight: '#C9A84C',
  goldBg: '#FDF8E8',
  background: '#FDFCFA',
  gray: '#F3F4F6',
  grayBorder: '#D1D5DB',
  textPrimary: '#111827',
  textMuted: '#6B7280',
};

// Proposed penance options
const PENANCE_OPTIONS = [
  "Pas d'alcool",
  'Jeûne le vendredi',
  'Douche froide',
  'Pas de viande',
  'Pas de sucre ajouté',
  'Dormir par terre 1x/semaine',
  'Pas de musique profane',
  'Se lever à 6h',
  'Pas de snacks/gourmandises',
  'Pas de café/thé',
];

interface PenanceItemProps {
  title: string;
  isSelected: boolean;
  onToggle: () => void;
}

function PenanceItem({ title, isSelected, onToggle }: PenanceItemProps) {
  return (
    <Pressable
      className="flex-row items-center p-4 rounded-xl mb-3"
      style={{
        backgroundColor: isSelected ? COLORS.goldBg : COLORS.gray,
        borderWidth: 2,
        borderColor: isSelected ? COLORS.goldLight : COLORS.grayBorder,
      }}
      onPress={onToggle}
    >
      {/* Checkbox */}
      <View
        className="w-6 h-6 rounded-md items-center justify-center mr-4"
        style={{
          backgroundColor: isSelected ? COLORS.gold : 'transparent',
          borderWidth: isSelected ? 0 : 2,
          borderColor: COLORS.grayBorder,
        }}
      >
        {isSelected && <Feather name="check" size={16} color="white" />}
      </View>

      {/* Title */}
      <Text
        className="flex-1 text-base"
        style={{
          color: isSelected ? COLORS.gold : COLORS.textPrimary,
          fontWeight: isSelected ? '600' : '400',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default function PenanceEditScreen() {
  const router = useRouter();
  const {
    selectionCount,
    canValidate,
    isLoading,
    isSubmitting,
    error,
    toggle,
    isSelected,
    submit,
  } = usePenanceEdit();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View className="px-6 pt-12 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="w-10" />
          <Text
            className="text-2xl text-center"
            style={{
              color: COLORS.gold,
              fontFamily: 'Georgia',
              fontWeight: '700',
            }}
          >
            Modifier mes pénitences
          </Text>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Feather name="x" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text
          className="text-base text-center mb-6"
          style={{ color: COLORS.textMuted }}
        >
          Choisis 5 parmi les propositions
        </Text>

        {/* Info Box */}
        <View
          className="p-4 rounded-xl mb-4"
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
            Prends le temps du discernement.
          </Text>
        </View>
      </View>

      {/* Scrollable List */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {PENANCE_OPTIONS.map((title) => (
          <PenanceItem
            key={title}
            title={title}
            isSelected={isSelected(title)}
            onToggle={() => toggle(title)}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-8 pt-4" style={{ backgroundColor: COLORS.background }}>
        {/* Error Message */}
        {error && (
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        )}

        {/* Counter */}
        <Text
          className="text-center mb-4 text-base"
          style={{
            color: canValidate ? COLORS.gold : COLORS.textMuted,
            fontWeight: canValidate ? '600' : '400',
          }}
        >
          {selectionCount}/5 sélectionnés
        </Text>

        {/* Validate Button */}
        <Pressable
          className="py-4 rounded-xl items-center flex-row justify-center"
          style={{
            backgroundColor: canValidate ? COLORS.gold : COLORS.grayBorder,
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onPress={submit}
          disabled={!canValidate || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text
                className="text-lg mr-2"
                style={{
                  color: canValidate ? 'white' : COLORS.textMuted,
                  fontFamily: 'Georgia',
                  fontWeight: '600',
                }}
              >
                Valider
              </Text>
              <Feather
                name="check"
                size={20}
                color={canValidate ? 'white' : COLORS.textMuted}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
