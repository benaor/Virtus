/**
 * useDayProgress Hook
 * Fetches and manages day progress state using GetDayProgressUseCase
 */

import { useState, useEffect, useCallback } from 'react';
import type { DayProgress } from '@domain/entities';
import { getGetDayProgressUseCase } from '@core/di/container';
import { useDayStore } from '@presentation/stores/useDayStore';

interface UseDayProgressResult {
  /** The current day's progress, null while loading or if error */
  progress: DayProgress | null;
  /** Whether the progress is currently being loaded */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Refresh the progress data (call after toggling an engagement) */
  refresh: () => void;
}

export function useDayProgress(): UseDayProgressResult {
  const currentDate = useDayStore((state) => state.currentDate);
  const [progress, setProgress] = useState<DayProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const useCase = getGetDayProgressUseCase();
      const result = await useCase.execute(currentDate);
      setProgress(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
      setProgress(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  // Load progress on mount and when date changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const refresh = useCallback(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    isLoading,
    error,
    refresh,
  };
}
