/**
 * usePenanceSelection Hook
 * Manages penance selection state during onboarding
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { getSetupPenanceEngagementsUseCase, getNotificationService } from '@core/di/container';
import { useOnboardingStore } from '@presentation/stores/useOnboardingStore';
import { FEATURE_FLAGS, PENANCE_OPTIONS } from '@core/constants';

const MAX_SELECTIONS = 5;

export function usePenanceSelection() {
  const router = useRouter();
  const setOnboardingCompleted = useOnboardingStore((state) => state.setCompleted);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [customEntries, setCustomEntries] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state: combined list of selected titles
  const selectedTitles = useMemo(
    () => [...selectedSuggestions, ...customEntries],
    [selectedSuggestions, customEntries]
  );

  const selectionCount = selectedTitles.length;

  const canAddMore = useMemo(
    () => selectionCount < MAX_SELECTIONS,
    [selectionCount]
  );

  const canValidate = useMemo(
    () => selectionCount === MAX_SELECTIONS,
    [selectionCount]
  );

  const toggle = useCallback((title: string) => {
    setSelectedSuggestions((current) => {
      const isSelected = current.includes(title);

      if (isSelected) {
        // Remove from selection
        return current.filter((t) => t !== title);
      } else {
        // Add to selection (only if under max total)
        if (selectedTitles.length >= MAX_SELECTIONS) {
          return current;
        }
        return [...current, title];
      }
    });
  }, [selectedTitles.length]);

  const isSelected = useCallback(
    (title: string) => selectedSuggestions.includes(title),
    [selectedSuggestions]
  );

  const addCustomEntry = useCallback(() => {
    if (selectionCount >= MAX_SELECTIONS) return;
    setCustomEntries((current) => [...current, '']);
  }, [selectionCount]);

  const removeCustomEntry = useCallback((index: number) => {
    setCustomEntries((current) => current.filter((_, i) => i !== index));
  }, []);

  const updateCustomEntry = useCallback((index: number, text: string) => {
    setCustomEntries((current) =>
      current.map((entry, i) => (i === index ? text : entry))
    );
  }, []);

  const submit = useCallback(async () => {
    if (!canValidate || isSubmitting) return;

    // Client-side validation: check that all custom entries are non-empty
    const hasEmptyCustomEntry = customEntries.some((entry) => entry.trim() === '');
    if (hasEmptyCustomEntry) {
      setError('Tous les champs personnalisés doivent être remplis');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save penance selections (this also persists onboarding completion to database)
      const useCase = getSetupPenanceEngagementsUseCase();
      await useCase.execute(selectedTitles);

      // Setup notifications at end of onboarding
      if (FEATURE_FLAGS.reminders) {
        const notificationService = getNotificationService();
        const permissionGranted = await notificationService.requestPermissions();
        if (permissionGranted) {
          await notificationService.scheduleDefaults();
        }
      }

      // Update store BEFORE navigation to prevent race condition
      setOnboardingCompleted();

      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  }, [canValidate, isSubmitting, selectedTitles, customEntries, router, setOnboardingCompleted]);

  return {
    selectedSuggestions,
    customEntries,
    selectedTitles,
    selectionCount,
    canAddMore,
    canValidate,
    isSubmitting,
    error,
    toggle,
    isSelected,
    addCustomEntry,
    removeCustomEntry,
    updateCustomEntry,
    submit,
  };
}
