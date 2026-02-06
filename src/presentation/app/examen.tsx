/**
 * Examen Screen
 * Daily examination of conscience (modal)
 * 5 steps + graces section
 */

import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDayStore } from '@presentation/stores/useDayStore';
import { useExamen } from '@presentation/hooks';

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
  cardBg: '#FFFFFF',
};

// Fixed examen steps
const EXAMEN_STEPS = [
  { step: 1, icon: '🙏', title: 'Action de grâce', prompt: "Pour quoi suis-je reconnaissant aujourd'hui ?" },
  { step: 2, icon: '🕯', title: 'Demande de lumière', prompt: 'Esprit Saint, éclaire ma conscience.' },
  { step: 3, icon: '🔍', title: 'Revue de la journée', prompt: "Qu'ai-je vécu ? Où ai-je senti la présence de Dieu ?" },
  { step: 4, icon: '💔', title: 'Contrition', prompt: "Où ai-je manqué d'amour envers Dieu et mon prochain ?" },
  { step: 5, icon: '⭐', title: 'Résolution', prompt: 'Quel point concret pour demain ?' },
];

/**
 * Format current time as HH:MM
 */
function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Step card component
 */
interface StepCardProps {
  step: number;
  icon: string;
  title: string;
  prompt: string;
  content: string;
  isSaving: boolean;
  onChangeText: (text: string) => void;
}

function StepCard({ step, icon, title, prompt, content, isSaving, onChangeText }: StepCardProps) {
  return (
    <View
      className="rounded-xl p-4 mb-4"
      style={{
        backgroundColor: COLORS.cardBg,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{icon}</Text>
          <View>
            <Text
              className="text-xs"
              style={{ color: COLORS.textMuted }}
            >
              ÉTAPE {step}
            </Text>
            <Text
              className="text-base font-semibold"
              style={{ color: COLORS.textPrimary }}
            >
              {title}
            </Text>
          </View>
        </View>
        {isSaving && (
          <ActivityIndicator size="small" color={COLORS.textMuted} />
        )}
      </View>

      {/* Prompt */}
      <Text
        className="text-sm mb-3"
        style={{
          color: COLORS.textSecondary,
          fontStyle: 'italic',
        }}
      >
        {prompt}
      </Text>

      {/* Input */}
      <TextInput
        className="text-base p-3 rounded-lg"
        style={{
          backgroundColor: COLORS.grayBg,
          color: COLORS.textPrimary,
          minHeight: 80,
          textAlignVertical: 'top',
        }}
        multiline
        placeholder="Écris tes pensées..."
        placeholderTextColor={COLORS.textMuted}
        value={content}
        onChangeText={onChangeText}
      />
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
      <Text
        className="mt-4 text-base"
        style={{ color: COLORS.textMuted }}
      >
        Chargement...
      </Text>
    </View>
  );
}

export default function ExamenScreen() {
  const router = useRouter();
  const currentDate = useDayStore((state) => state.currentDate);
  const currentDay = useDayStore((state) => state.currentDay);

  const {
    stepContents,
    gracesContent,
    isLoading,
    savingSteps,
    isSavingGraces,
    updateStep,
    updateGraces,
    finishExamen,
  } = useExamen(currentDate);

  // Format day of week
  const dayOfWeek = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  // Handle finish button
  const handleFinish = async () => {
    await finishExamen();
    router.back();
  };

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
      {/* Header */}
      <View className="px-6 pt-6 pb-4 items-center">
        {/* Label */}
        <Text
          className="text-xs tracking-widest mb-2"
          style={{ color: COLORS.gold }}
        >
          EXAMEN DU SOIR
        </Text>

        {/* Day title */}
        <Text
          className="text-2xl text-center mb-2"
          style={{
            color: COLORS.textPrimary,
            fontFamily: 'Georgia',
            fontWeight: '700',
          }}
        >
          {currentDay !== null ? `Jour ${currentDay}` : 'Aujourd\'hui'} — {capitalizedDay}
        </Text>

        {/* Time and instruction */}
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color={COLORS.textMuted} />
          <Text
            className="text-sm ml-1"
            style={{ color: COLORS.textMuted }}
          >
            {formatTime()}
          </Text>
          <Text
            className="text-sm mx-2"
            style={{ color: COLORS.textMuted }}
          >
            ·
          </Text>
          <Text
            className="text-sm"
            style={{
              color: COLORS.goldLight,
              fontStyle: 'italic',
            }}
          >
            Prends 10 minutes de calme
          </Text>
        </View>
      </View>

      {/* Separator */}
      <View
        className="mx-6 h-px mb-6"
        style={{ backgroundColor: COLORS.border }}
      />

      {/* Examen steps */}
      <View className="px-6">
        {EXAMEN_STEPS.map(({ step, icon, title, prompt }) => (
          <StepCard
            key={step}
            step={step}
            icon={icon}
            title={title}
            prompt={prompt}
            content={stepContents.get(step) ?? ''}
            isSaving={savingSteps.get(step) ?? false}
            onChangeText={(text) => updateStep(step, text)}
          />
        ))}
      </View>

      {/* Graces section */}
      <View className="px-6 mt-2">
        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: COLORS.goldBg }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">✨</Text>
              <Text
                className="text-base font-semibold"
                style={{ color: COLORS.gold }}
              >
                Grâces reçues aujourd'hui
              </Text>
            </View>
            {isSavingGraces && (
              <ActivityIndicator size="small" color={COLORS.gold} />
            )}
          </View>

          {/* Input */}
          <TextInput
            className="text-base p-3 rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              color: COLORS.textPrimary,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            multiline
            placeholder="Note les grâces et bénédictions de cette journée..."
            placeholderTextColor={COLORS.textMuted}
            value={gracesContent}
            onChangeText={updateGraces}
          />
        </View>
      </View>

      {/* Finish button */}
      <View className="px-6 mt-8">
        <Pressable
          className="flex-row items-center justify-center py-4 rounded-xl"
          style={{ backgroundColor: COLORS.gold }}
          onPress={handleFinish}
        >
          <Text
            className="text-lg font-semibold mr-2"
            style={{ color: '#FFFFFF' }}
          >
            Terminer l'examen
          </Text>
          <Feather name="check" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Subtle note */}
      <Text
        className="text-xs text-center mt-4 px-6"
        style={{ color: COLORS.textMuted }}
      >
        Tes notes sont sauvegardées automatiquement
      </Text>
    </ScrollView>
  );
}
