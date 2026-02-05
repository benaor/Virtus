/**
 * Index Screen
 * Entry point that checks parcours status and redirects appropriately
 * Shows OutOfParcours screens when before/after the parcours period
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useDayStore } from '@presentation/stores/useDayStore';
import { LoadingScreen, OutOfParcours } from '@presentation/components';
import { isBeforeParcours, isAfterParcours } from '@domain/entities/Parcours';

export default function IndexScreen() {
  const router = useRouter();
  const currentDay = useDayStore((state) => state.currentDay);
  const isBeforeStart = useDayStore((state) => state.isBeforeStart);
  const isAfterEnd = useDayStore((state) => state.isAfterEnd);

  useEffect(() => {
    // If we're within the parcours period, redirect to tabs
    // The _layout.tsx will handle onboarding check
    if (currentDay !== null) {
      router.replace('/(tabs)');
    }
  }, [currentDay, router]);

  // Show OutOfParcours if before or after the parcours period
  if (isBeforeStart || isAfterEnd) {
    return <OutOfParcours />;
  }

  // Show loading while determining state
  return <LoadingScreen />;
}
