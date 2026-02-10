/**
 * useHomeData Hook
 * Fetches all data needed for the Home screen
 */

import { useState, useEffect, useCallback } from 'react';
import type { Engagement, Exhortation, DailyCheck } from '@domain/entities';
import {
  getEngagementRepository,
  getDailyCheckRepository,
  getGetExhortationUseCase,
  getToggleEngagementCheckUseCase,
} from '@core/di/container';
import { useDayStore, useEngagementStore } from '@presentation/stores';
import { useDayProgress } from './useDayProgress';

interface UseHomeDataResult {
  /** All active engagements */
  engagements: Engagement[];
  /** Map of engagement ID to checked state */
  checks: Map<string, boolean>;
  /** Today's exhortation */
  exhortation: Exhortation | null;
  /** Day progress (from useDayProgress) */
  progress: ReturnType<typeof useDayProgress>['progress'];
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Toggle an engagement check */
  toggleEngagement: (engagementId: string) => Promise<void>;
  /** Refresh all data */
  refresh: () => void;
}

export function useHomeData(): UseHomeDataResult {
  const currentDate = useDayStore((state) => state.currentDate);
  const currentDay = useDayStore((state) => state.currentDay);
  const engagementVersion = useEngagementStore((state) => state.version);

  const { progress, isLoading: progressLoading, refresh: refreshProgress } = useDayProgress();

  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [checks, setChecks] = useState<Map<string, boolean>>(new Map());
  const [exhortation, setExhortation] = useState<Exhortation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (currentDay === null) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const engagementRepo = getEngagementRepository();
      const checkRepo = getDailyCheckRepository();
      const exhortationUseCase = getGetExhortationUseCase();

      const [loadedEngagements, loadedChecks, loadedExhortation] = await Promise.all([
        engagementRepo.getActive(),
        checkRepo.getChecksForDate(currentDate),
        exhortationUseCase.execute(currentDay),
      ]);

      setEngagements(loadedEngagements);

      // Build checks map
      const checksMap = new Map<string, boolean>();
      loadedChecks.forEach((check: DailyCheck) => {
        checksMap.set(check.engagementId, check.checked);
      });
      setChecks(checksMap);

      setExhortation(loadedExhortation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, currentDay, engagementVersion]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleEngagement = useCallback(async (engagementId: string) => {
    try {
      const toggleUseCase = getToggleEngagementCheckUseCase();
      const updatedCheck = await toggleUseCase.execute(engagementId, currentDate);

      // Update local state immediately for responsiveness
      setChecks((prev) => {
        const next = new Map(prev);
        next.set(engagementId, updatedCheck.checked);
        return next;
      });

      // Refresh progress to update percentages
      refreshProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du toggle');
    }
  }, [currentDate, refreshProgress]);

  const refresh = useCallback(() => {
    loadData();
    refreshProgress();
  }, [loadData, refreshProgress]);

  return {
    engagements,
    checks,
    exhortation,
    progress,
    isLoading: isLoading || progressLoading,
    error,
    toggleEngagement,
    refresh,
  };
}
