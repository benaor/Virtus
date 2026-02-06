/**
 * useDayStore
 * Zustand store for managing current day state
 */

import { create } from 'zustand';
import {
  type Period,
  getCurrentDay,
  getCurrentPeriod,
  isBeforeParcours,
  isAfterParcours,
} from '@domain/entities/Parcours';

/**
 * Format a Date to ISO string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface DayState {
  /** Current date in YYYY-MM-DD format */
  currentDate: string;
  /** Current day of the parcours (1-70), null if outside parcours */
  currentDay: number | null;
  /** Current period of the parcours, null if outside parcours */
  currentPeriod: Period | null;
  /** Whether we're before the parcours start date */
  isBeforeStart: boolean;
  /** Whether we're after the parcours end date */
  isAfterEnd: boolean;
}

interface DayActions {
  /** Recalculate currentDay and currentPeriod from today's date */
  refreshDay: () => void;
}

type DayStore = DayState & DayActions;

/**
 * Calculate initial state from current date
 */
function calculateDayState(): DayState {
  const today = new Date();
  const currentDate = formatDateISO(today);
  const currentDay = getCurrentDay(today);
  const currentPeriod = currentDay !== null ? getCurrentPeriod(currentDay) : null;
  const isBeforeStart = isBeforeParcours(today);
  const isAfterEnd = isAfterParcours(today);

  return {
    currentDate,
    currentDay,
    currentPeriod,
    isBeforeStart,
    isAfterEnd,
  };
}

export const useDayStore = create<DayStore>((set) => ({
  // Initial state
  ...calculateDayState(),

  // Actions
  refreshDay: () => {
    set(calculateDayState());
  },
}));
