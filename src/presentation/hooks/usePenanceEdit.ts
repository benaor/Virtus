/**
 * usePenanceEdit Hook
 * Manages penance editing for existing users
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getEngagementRepository } from '@core/di/container';

const MAX_SELECTIONS = 5;

export function usePenanceEdit() {
  const router = useRouter();
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing penances on mount
  useEffect(() => {
    async function loadPenances() {
      try {
        const repository = getEngagementRepository();
        const penances = await repository.getByCategory('penance');
        const titles = penances.map((p) => p.title);
        setSelectedTitles(titles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    }

    loadPenances();
  }, []);

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
      // Replace penance selections
      const repository = getEngagementRepository();
      await repository.replacePenanceEngagements(
        selectedTitles.map((title) => ({ title }))
      );

      // Navigate back
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  }, [canValidate, isSubmitting, selectedTitles, router]);

  return {
    selectedTitles,
    selectionCount,
    canValidate,
    isLoading,
    isSubmitting,
    error,
    toggle,
    isSelected,
    submit,
  };
}
