/**
 * useBilan Hook
 * Orchestrates stats, encouragement, and confession tracking for Bilan screen
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getGetOverallStatsUseCase,
  getGetWeeklyStatsUseCase,
  getSettingsRepository,
} from '@core/di/container';
import type { OverallStats } from '@domain/usecases/GetOverallStatsUseCase';
import type { WeeklyEngagementStats } from '@domain/usecases/GetWeeklyStatsUseCase';
import { generateEncouragement } from '@domain/helpers/generateEncouragement';
import { useDayStore, useEngagementStore } from '@presentation/stores';
import { getDayDate } from '@domain/entities/Parcours';

// Settings keys for confession tracking
const LAST_CONFESSION_KEY = 'last_confession_date';
const CONFESSION_GOAL_KEY = 'confession_goal_days';
const DEFAULT_CONFESSION_GOAL = 14; // Every 2 weeks

interface ConfessionInfo {
  lastDate: string | null;
  daysSince: number | null;
  goalDays: number;
  daysUntilGoal: number | null;
  isOverdue: boolean;
}

interface EncouragementInfo {
  message: string;
  emoji: string;
}

interface UseBilanResult {
  /** Overall fidelity stats by category */
  overallStats: OverallStats | null;
  /** Weekly engagement stats for heatmap */
  weeklyStats: WeeklyEngagementStats[];
  /** Week start date for the current week */
  weekStartDate: string;
  /** Encouragement message based on stats */
  encouragement: EncouragementInfo | null;
  /** Confession tracking info */
  confession: ConfessionInfo;
  /** Current day in parcours */
  currentDay: number | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Record a new confession date */
  recordConfession: (date?: string) => Promise<void>;
  /** Update confession goal (in days) */
  updateConfessionGoal: (days: number) => Promise<void>;
  /** Refresh all data */
  refresh: () => void;
}

/**
 * Get Monday of the current week
 */
function getWeekStartDate(currentDay: number): string {
  const dayDate = getDayDate(currentDay);
  const dayOfWeek = dayDate.getUTCDay(); // 0 = Sunday
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Make Monday = 0

  const monday = new Date(dayDate);
  monday.setUTCDate(dayDate.getUTCDate() - daysToSubtract);

  return monday.toISOString().split('T')[0];
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T12:00:00Z');
  const d2 = new Date(date2 + 'T12:00:00Z');
  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get today's date as ISO string
 */
function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function useBilan(): UseBilanResult {
  const currentDay = useDayStore((state) => state.currentDay);
  const engagementVersion = useEngagementStore((state) => state.version);

  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyEngagementStats[]>([]);
  const [encouragement, setEncouragement] = useState<EncouragementInfo | null>(null);
  const [confession, setConfession] = useState<ConfessionInfo>({
    lastDate: null,
    daysSince: null,
    goalDays: DEFAULT_CONFESSION_GOAL,
    daysUntilGoal: null,
    isOverdue: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate week start date
  const weekStartDate = currentDay !== null ? getWeekStartDate(currentDay) : getTodayISO();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const overallStatsUseCase = getGetOverallStatsUseCase();
      const weeklyStatsUseCase = getGetWeeklyStatsUseCase();
      const settingsRepo = getSettingsRepository();

      // Load all data in parallel
      const [stats, weekly, lastConfession, goalDays] = await Promise.all([
        overallStatsUseCase.execute(),
        currentDay !== null ? weeklyStatsUseCase.execute(weekStartDate) : Promise.resolve([]),
        settingsRepo.get(LAST_CONFESSION_KEY),
        settingsRepo.get(CONFESSION_GOAL_KEY),
      ]);

      setOverallStats(stats);
      setWeeklyStats(weekly);

      // Generate encouragement
      const encouragementResult = generateEncouragement(stats);
      setEncouragement(encouragementResult);

      // Calculate confession info
      const goal = goalDays ? parseInt(goalDays, 10) : DEFAULT_CONFESSION_GOAL;
      const today = getTodayISO();
      let daysSince: number | null = null;
      let daysUntilGoal: number | null = null;
      let isOverdue = false;

      if (lastConfession) {
        daysSince = daysBetween(lastConfession, today);
        daysUntilGoal = goal - daysSince;
        isOverdue = daysUntilGoal < 0;
      }

      setConfession({
        lastDate: lastConfession,
        daysSince,
        goalDays: goal,
        daysUntilGoal,
        isOverdue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [currentDay, weekStartDate, engagementVersion]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recordConfession = useCallback(async (date?: string) => {
    try {
      const settingsRepo = getSettingsRepository();
      const confessionDate = date ?? getTodayISO();
      await settingsRepo.set(LAST_CONFESSION_KEY, confessionDate);

      // Recalculate confession info
      const today = getTodayISO();
      const daysSince = daysBetween(confessionDate, today);
      const daysUntilGoal = confession.goalDays - daysSince;

      setConfession((prev) => ({
        ...prev,
        lastDate: confessionDate,
        daysSince,
        daysUntilGoal,
        isOverdue: daysUntilGoal < 0,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    }
  }, [confession.goalDays]);

  const updateConfessionGoal = useCallback(async (days: number) => {
    try {
      const settingsRepo = getSettingsRepository();
      await settingsRepo.set(CONFESSION_GOAL_KEY, days.toString());

      // Recalculate with new goal
      let daysUntilGoal: number | null = null;
      let isOverdue = false;

      if (confession.daysSince !== null) {
        daysUntilGoal = days - confession.daysSince;
        isOverdue = daysUntilGoal < 0;
      }

      setConfession((prev) => ({
        ...prev,
        goalDays: days,
        daysUntilGoal,
        isOverdue,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    }
  }, [confession.daysSince]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    overallStats,
    weeklyStats,
    weekStartDate,
    encouragement,
    confession,
    currentDay,
    isLoading,
    error,
    recordConfession,
    updateConfessionGoal,
    refresh,
  };
}
