/**
 * usePenanceSelection Hook
 * Manages penance selection state during onboarding
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { getSetupPenanceEngagementsUseCase, getNotificationService } from '@core/di/container';

const MAX_SELECTIONS = 5;

export function usePenanceSelection() {
  const router = useRouter();
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canValidate = useMemo(
    () => selectedTitles.length === MAX_SELECTIONS,
    [selectedTitles]
  );

  const selectionCount = selectedTitles.length;

  const toggle = useCallback((title: string) => {
    setSelectedTitles((current) => {
      const isSelected = current.includes(title);

      if (isSelected) {
        // Remove from selection
        return current.filter((t) => t !== title);
      } else {
        // Add to selection (only if under max)
        if (current.length >= MAX_SELECTIONS) {
          return current;
        }
        return [...current, title];
      }
    });
  }, []);

  const isSelected = useCallback(
    (title: string) => selectedTitles.includes(title),
    [selectedTitles]
  );

  const submit = useCallback(async () => {
    if (!canValidate || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Save penance selections
      const useCase = getSetupPenanceEngagementsUseCase();
      await useCase.execute(selectedTitles);

      // Setup notifications at end of onboarding
      const notificationService = getNotificationService();
      const permissionGranted = await notificationService.requestPermissions();
      if (permissionGranted) {
        await notificationService.scheduleDefaults();
      }

      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  }, [canValidate, isSubmitting, selectedTitles, router]);

  return {
    selectedTitles,
    selectionCount,
    canValidate,
    isSubmitting,
    error,
    toggle,
    isSelected,
    submit,
  };
}
