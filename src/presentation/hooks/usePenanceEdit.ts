/**
 * usePenanceEdit Hook
 * Manages penance editing for existing users
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getEngagementRepository } from '@core/di/container';
import { useEngagementStore } from '@presentation/stores';
import { PENANCE_OPTIONS } from '@core/constants';

const MAX_SELECTIONS = 5;

export function usePenanceEdit() {
  const router = useRouter();
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [customEntries, setCustomEntries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing penances on mount and partition them
  useEffect(() => {
    async function loadPenances() {
      try {
        const repository = getEngagementRepository();
        const penances = await repository.getByCategory('penance');
        // Filter to only active penances
        const activeTitles = penances.filter((p) => p.isActive).map((p) => p.title);

        // Partition into suggestions vs custom entries
        const suggestions: string[] = [];
        const custom: string[] = [];

        activeTitles.forEach((title) => {
          if (PENANCE_OPTIONS.includes(title as any)) {
            suggestions.push(title);
          } else {
            custom.push(title);
          }
        });

        setSelectedSuggestions(suggestions);
        setCustomEntries(custom);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    }

    loadPenances();
  }, []);

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
      // Replace penance selections
      const repository = getEngagementRepository();
      await repository.replacePenanceEngagements(
        selectedTitles.map((title) => ({ title }))
      );

      // Trigger refresh in hooks that depend on engagements
      useEngagementStore.getState().invalidate();

      // Navigate back
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  }, [canValidate, isSubmitting, selectedTitles, customEntries, router]);

  return {
    selectedSuggestions,
    customEntries,
    selectedTitles,
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
  };
}
