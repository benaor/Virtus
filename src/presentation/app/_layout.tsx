/**
 * Root Layout
 * Initializes the database, handles onboarding redirection,
 * manages splash screen, and detects day changes
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { container } from '@core/di/container';
import { useDayStore } from '@presentation/stores/useDayStore';
import { LoadingScreen } from '@presentation/components';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);
  const refreshDay = useDayStore((state) => state.refreshDay);
  const currentDay = useDayStore((state) => state.currentDay);

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

  // Handle day change detection when app comes to foreground
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        const previousDay = currentDay;
        refreshDay();

        // Log day change for debugging
        const newDay = useDayStore.getState().currentDay;
        if (previousDay !== newDay) {
          console.log(`Day changed: ${previousDay} -> ${newDay}`);
        }
      }

      appState.current = nextAppState;
    },
    [currentDay, refreshDay]
  );

  // Subscribe to AppState changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

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

  // Show loading screen while initializing
  if (!isReady) {
    return <LoadingScreen />;
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
