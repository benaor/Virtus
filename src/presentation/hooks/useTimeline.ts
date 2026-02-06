/**
 * useTimeline Hook
 * Fetches weekly progress data for the timeline view
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getDailyCheckRepository,
  getEngagementRepository,
} from '@core/di/container';
import { getDayDate } from '@domain/entities/Parcours';
import { TOTAL_DAYS } from '@core/constants/parcours';
import { useDayStore } from '@presentation/stores/useDayStore';

interface DayProgress {
  day: number;
  date: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  percentage: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface UseTimelineResult {
  /** Progress data for current week (7 days) */
  weekDays: DayProgress[];
  /** Week number in the parcours */
  weekNumber: number;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Refresh the data */
  refresh: () => void;
}

/**
 * Format a Date to ISO string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the Monday of the week containing the given day
 */
function getWeekStart(day: number): number {
  // Calculate which week this day belongs to (0-indexed)
  const weekIndex = Math.floor((day - 1) / 7);
  // Return the first day of that week
  return weekIndex * 7 + 1;
}

export function useTimeline(): UseTimelineResult {
  const currentDay = useDayStore((state) => state.currentDay);

  const [weekDays, setWeekDays] = useState<DayProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate week number
  const weekNumber = currentDay !== null ? Math.ceil(currentDay / 7) : 1;

  const loadData = useCallback(async () => {
    if (currentDay === null) {
      setWeekDays([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const checkRepo = getDailyCheckRepository();
      const engagementRepo = getEngagementRepository();

      // Get total active engagements count
      const engagements = await engagementRepo.getActive();
      const totalEngagements = engagements.length;

      // Get the week containing the current day
      const weekStart = getWeekStart(currentDay);
      const days: DayProgress[] = [];

      for (let i = 0; i < 7; i++) {
        const day = weekStart + i;

        // Skip days outside the parcours
        if (day < 1 || day > TOTAL_DAYS) {
          continue;
        }

        const dayDate = getDayDate(day);
        const dateStr = formatDateISO(dayDate);
        const dayOfWeek = dayDate.getUTCDay(); // 0 = Sunday

        const isPast = day < currentDay;
        const isToday = day === currentDay;
        const isFuture = day > currentDay;

        let percentage = 0;

        if (!isFuture && totalEngagements > 0) {
          // Get checks for this day
          const checks = await checkRepo.getChecksForDate(dateStr);
          const checkedCount = checks.filter((c) => c.checked).length;
          percentage = Math.round((checkedCount / totalEngagements) * 100);
        }

        days.push({
          day,
          date: dateStr,
          dayOfWeek,
          percentage,
          isPast,
          isToday,
          isFuture,
        });
      }

      setWeekDays(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [currentDay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    weekDays,
    weekNumber,
    isLoading,
    error,
    refresh,
  };
}
