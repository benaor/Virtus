/**
 * Penance Edit Screen (Modal)
 * Edit the 5 personal penance engagements
 */

import { View, Text, Pressable, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { usePenanceEdit } from '@presentation/hooks';
import { PENANCE_OPTIONS } from '@core/constants';

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

interface CustomEntryItemProps {
  value: string;
  index: number;
  onUpdate: (index: number, text: string) => void;
  onRemove: (index: number) => void;
}

function CustomEntryItem({ value, index, onUpdate, onRemove }: CustomEntryItemProps) {
  return (
    <View
      className="flex-row items-center p-4 rounded-xl mb-3"
      style={{
        backgroundColor: COLORS.gray,
        borderWidth: 2,
        borderColor: COLORS.grayBorder,
      }}
    >
      <TextInput
        className="flex-1 text-base"
        style={{
          color: COLORS.textPrimary,
        }}
        value={value}
        onChangeText={(text) => onUpdate(index, text)}
        placeholder="Ton effort personnalisé..."
        placeholderTextColor={COLORS.textMuted}
      />
      <Pressable
        className="ml-3 w-8 h-8 items-center justify-center"
        onPress={() => onRemove(index)}
      >
        <Feather name="x" size={20} color={COLORS.textMuted} />
      </Pressable>
    </View>
  );
}

export default function PenanceEditScreen() {
  const router = useRouter();
  const {
    customEntries,
    selectionCount,
    canAddMore,
    canValidate,
    isLoading,
    isSubmitting,
    error,
    toggle,
    isSelected,
    addCustomEntry,
    removeCustomEntry,
    updateCustomEntry,
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
          Choisis 5 efforts (suggestions ou personnalisés)
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
        {/* Suggestion options */}
        {PENANCE_OPTIONS.map((title) => (
          <PenanceItem
            key={title}
            title={title}
            isSelected={isSelected(title)}
            onToggle={() => toggle(title)}
          />
        ))}

        {/* Custom entries */}
        {customEntries.map((entry, index) => (
          <CustomEntryItem
            key={`custom-${index}`}
            value={entry}
            index={index}
            onUpdate={updateCustomEntry}
            onRemove={removeCustomEntry}
          />
        ))}

        {/* Add custom entry button */}
        <View>
          <Pressable
            className="flex-row items-center justify-center p-4 rounded-xl mb-3"
            style={{
              backgroundColor: COLORS.background,
              borderWidth: 2,
              borderColor: canAddMore ? COLORS.goldLight : COLORS.grayBorder,
              borderStyle: 'dashed',
            }}
            onPress={canAddMore ? addCustomEntry : undefined}
            disabled={!canAddMore}
          >
            <Feather name="plus" size={20} color={canAddMore ? COLORS.gold : COLORS.textMuted} />
            <Text
              className="ml-2 text-base"
              style={{
                color: canAddMore ? COLORS.gold : COLORS.textMuted,
                fontWeight: '500',
              }}
            >
              Ajouter un effort personnalisé
            </Text>
          </Pressable>
          {!canAddMore && (
            <Text
              className="text-sm text-center mb-3"
              style={{
                color: COLORS.textMuted,
                fontStyle: 'italic',
              }}
            >
              Désélectionne une suggestion pour libérer une place
            </Text>
          )}
        </View>
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
