/**
 * Settings Screen (Modal)
 * App settings for notifications, engagements, and digital sobriety
 */

import { View, Text, ScrollView, TouchableOpacity, Switch as RNSwitch, Alert, Linking, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSettings } from '@presentation/hooks';

// Conditionally import @expo/ui Switch for iOS
let ExpoSwitch: React.ComponentType<{
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
}> | null = null;

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ExpoUI = require('@expo/ui/swift-ui');
    ExpoSwitch = ExpoUI.Switch;
  } catch {
    // Fallback to RN Switch
  }
}

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
  white: '#FFFFFF',
  danger: '#EF4444',
};

/**
 * Format time for display
 */
function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}h${minute.toString().padStart(2, '0')}`;
}

/**
 * Cross-platform Toggle component
 */
interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function Toggle({ value, onValueChange }: ToggleProps) {
  if (Platform.OS === 'ios' && ExpoSwitch) {
    return <ExpoSwitch value={value} onValueChange={onValueChange} color={COLORS.gold} />;
  }

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.grayLight, true: COLORS.goldLight }}
      thumbColor={value ? COLORS.gold : COLORS.grayBg}
    />
  );
}

/**
 * Section header component
 */
interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text
      className="text-xs font-semibold tracking-wider mb-2 px-1"
      style={{ color: COLORS.gold }}
    >
      {title}
    </Text>
  );
}

/**
 * Setting row with toggle
 */
interface SettingToggleRowProps {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: () => void;
}

function SettingToggleRow({ label, subtitle, value, onValueChange }: SettingToggleRowProps) {
  return (
    <View
      className="flex-row items-center justify-between py-4 px-4"
      style={{ backgroundColor: COLORS.white }}
    >
      <View className="flex-1 pr-4">
        <Text className="text-base" style={{ color: COLORS.textPrimary }}>
          {label}
        </Text>
        {subtitle && (
          <Text className="text-sm mt-0.5" style={{ color: COLORS.textMuted }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

/**
 * Setting row that navigates
 */
interface SettingNavRowProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingNavRow({ label, subtitle, onPress, danger }: SettingNavRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-4"
      style={{ backgroundColor: COLORS.white }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1 pr-4">
        <Text
          className="text-base"
          style={{ color: danger ? COLORS.danger : COLORS.textPrimary }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text className="text-sm mt-0.5" style={{ color: COLORS.textMuted }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

/**
 * Setting row with value display
 */
interface SettingValueRowProps {
  label: string;
  value: string;
}

function SettingValueRow({ label, value }: SettingValueRowProps) {
  return (
    <View
      className="flex-row items-center justify-between py-4 px-4"
      style={{ backgroundColor: COLORS.white }}
    >
      <Text className="text-base" style={{ color: COLORS.textPrimary }}>
        {label}
      </Text>
      <Text className="text-base" style={{ color: COLORS.textMuted }}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Row separator
 */
function Separator() {
  return (
    <View className="h-px ml-4" style={{ backgroundColor: COLORS.grayLight }} />
  );
}

/**
 * Section container
 */
interface SectionProps {
  children: React.ReactNode;
}

function Section({ children }: SectionProps) {
  return (
    <View className="rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.white }}>
      {children}
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

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    isLoading,
    toggleMorningReminder,
    toggleEveningReminder,
    toggleScreenTimeReminder,
  } = useSettings();

  const handleModifyPenances = () => {
    Alert.alert(
      'Modifier mes pénitences',
      "Es-tu sûr ? Parles-en d'abord à ton binôme avant de changer tes engagements.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => router.push('/onboarding/penance'),
        },
      ]
    );
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://caremevirtus.fr');
  };

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="w-10" />
        <Text
          className="text-xl"
          style={{
            color: COLORS.textPrimary,
            fontFamily: 'Georgia',
            fontWeight: '700',
          }}
        >
          Réglages
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={handleClose}
        >
          <Feather name="x" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
      >
        {/* NOTIFICATIONS Section */}
        <View className="mb-6">
          <SectionHeader title="NOTIFICATIONS" />
          <Section>
            <SettingToggleRow
              label="Rappel matin (exhortation)"
              subtitle={formatTime(settings.morningTime.hour, settings.morningTime.minute)}
              value={settings.morningReminderEnabled}
              onValueChange={toggleMorningReminder}
            />
            <Separator />
            <SettingToggleRow
              label="Rappel soir (examen)"
              subtitle={formatTime(settings.eveningTime.hour, settings.eveningTime.minute)}
              value={settings.eveningReminderEnabled}
              onValueChange={toggleEveningReminder}
            />
          </Section>
        </View>

        {/* ENGAGEMENTS Section */}
        <View className="mb-6">
          <SectionHeader title="ENGAGEMENTS" />
          <Section>
            <SettingNavRow
              label="Modifier mes pénitences"
              onPress={handleModifyPenances}
            />
          </Section>
        </View>

        {/* SOBRIÉTÉ NUMÉRIQUE Section */}
        <View className="mb-6">
          <SectionHeader title="SOBRIÉTÉ NUMÉRIQUE" />
          <View
            className="rounded-xl p-4"
            style={{
              backgroundColor: COLORS.goldBg,
              borderWidth: 1,
              borderColor: COLORS.goldLight,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-base" style={{ color: COLORS.textPrimary }}>
                  Rappel temps d'écran
                </Text>
                <Text className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>
                  Notification après 10 min sur l'app
                </Text>
              </View>
              <Toggle
                value={settings.screenTimeReminderEnabled}
                onValueChange={toggleScreenTimeReminder}
              />
            </View>
          </View>
        </View>

        {/* À PROPOS Section */}
        <View className="mb-6">
          <SectionHeader title="À PROPOS" />
          <Section>
            <SettingValueRow label="Version" value={settings.appVersion} />
            <Separator />
            <SettingNavRow
              label="caremevirtus.fr"
              subtitle="Site officiel"
              onPress={handleOpenWebsite}
            />
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
