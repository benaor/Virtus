/**
 * Root Layout
 * Initializes the database and handles onboarding redirection
 */

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { container } from '@core/di/container';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Initialize database and check onboarding status
  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database (this also seeds it)
        container.getDatabase();

        // Check onboarding status
        const settingsRepo = container.getSettingsRepository();
        const completed = await settingsRepo.hasCompletedOnboarding();
        setHasCompletedOnboarding(completed);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setHasCompletedOnboarding(false);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    initialize();
  }, []);

  // Handle navigation based on onboarding status
  useEffect(() => {
    if (!isReady || hasCompletedOnboarding === null) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    if (!hasCompletedOnboarding && !inOnboarding) {
      // User hasn't completed onboarding, redirect to welcome
      router.replace('/onboarding/welcome');
    } else if (hasCompletedOnboarding && inOnboarding) {
      // User completed onboarding but is in onboarding flow, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isReady, hasCompletedOnboarding, segments]);

  // Don't render until ready
  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="examen"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Examen de conscience',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Réglages',
        }}
      />
    </Stack>
  );
}
