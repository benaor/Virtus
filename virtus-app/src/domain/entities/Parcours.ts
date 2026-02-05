/**
 * Parcours Domain Entity and Helper Functions
 * Pure functions for parcours date calculations
 *
 * IMPORTANT: This is domain layer - NO imports from @data or @presentation
 */

import {
  type Period,
  PARCOURS_START,
  PARCOURS_END,
  TOTAL_DAYS,
  PERIODS,
} from '@core/constants/parcours';

// Re-export types for convenience
export type { Period };

/**
 * Parse an ISO date string to a Date object at midnight UTC
 */
function parseDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Get the start of day (midnight) for a Date in UTC
 */
function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Calculate the difference in days between two dates
 */
function diffInDays(date1: Date, date2: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((date1.getTime() - date2.getTime()) / MS_PER_DAY);
}

/**
 * Get the current day of the parcours (1-70)
 * @param today - The current date
 * @returns The day number (1-70) or null if outside the parcours period
 */
export function getCurrentDay(today: Date): number | null {
  const startDate = parseDate(PARCOURS_START);
  const endDate = parseDate(PARCOURS_END);
  const todayNormalized = startOfDayUTC(today);

  // Check if before parcours start
  if (todayNormalized < startDate) {
    return null;
  }

  // Check if after parcours end
  if (todayNormalized > endDate) {
    return null;
  }

  // Calculate day number (1-based)
  const dayNumber = diffInDays(todayNormalized, startDate) + 1;

  return dayNumber;
}

/**
 * Get the period for a given day number
 * @param day - The day number (1-70)
 * @returns The period containing that day
 * @throws Error if day is out of range
 */
export function getCurrentPeriod(day: number): Period {
  if (day < 1 || day > TOTAL_DAYS) {
    throw new Error(`Day ${day} is out of range (1-${TOTAL_DAYS})`);
  }

  const period = PERIODS.find((p) => day >= p.startDay && day <= p.endDay);

  if (!period) {
    throw new Error(`No period found for day ${day}`);
  }

  return period;
}

/**
 * Get the date for a given day number
 * @param day - The day number (1-70)
 * @returns The Date object for that day
 * @throws Error if day is out of range
 */
export function getDayDate(day: number): Date {
  if (day < 1 || day > TOTAL_DAYS) {
    throw new Error(`Day ${day} is out of range (1-${TOTAL_DAYS})`);
  }

  const startDate = parseDate(PARCOURS_START);
  const targetDate = new Date(startDate);
  targetDate.setUTCDate(targetDate.getUTCDate() + day - 1);

  return targetDate;
}

/**
 * Check if the parcours is currently active
 * @param today - The current date
 * @returns true if today is within the parcours period
 */
export function isParcoursActive(today: Date): boolean {
  return getCurrentDay(today) !== null;
}

/**
 * Get the number of days remaining in the parcours
 * @param today - The current date
 * @returns The number of days remaining, or null if outside parcours
 */
export function getDaysRemaining(today: Date): number | null {
  const currentDay = getCurrentDay(today);
  if (currentDay === null) {
    return null;
  }
  return TOTAL_DAYS - currentDay;
}

/**
 * Get the progress percentage of the parcours
 * @param today - The current date
 * @returns Progress as a number between 0 and 1, or null if outside parcours
 */
export function getProgress(today: Date): number | null {
  const currentDay = getCurrentDay(today);
  if (currentDay === null) {
    return null;
  }
  return currentDay / TOTAL_DAYS;
}

/**
 * Format a day number as "Jour X"
 * @param day - The day number (1-70)
 * @returns Formatted string like "Jour 1", "Jour 42"
 */
export function formatDayLabel(day: number): string {
  return `Jour ${day}`;
}

/**
 * Check if the parcours hasn't started yet
 * @param today - The current date
 * @returns true if today is before the parcours start
 */
export function isBeforeParcours(today: Date): boolean {
  const startDate = parseDate(PARCOURS_START);
  const todayNormalized = startOfDayUTC(today);
  return todayNormalized < startDate;
}

/**
 * Check if the parcours has ended
 * @param today - The current date
 * @returns true if today is after the parcours end
 */
export function isAfterParcours(today: Date): boolean {
  const endDate = parseDate(PARCOURS_END);
  const todayNormalized = startOfDayUTC(today);
  return todayNormalized > endDate;
}

/**
 * Get the number of days until parcours starts
 * @param today - The current date
 * @returns Days until start, or null if parcours has already started
 */
export function getDaysUntilStart(today: Date): number | null {
  const startDate = parseDate(PARCOURS_START);
  const todayNormalized = startOfDayUTC(today);

  if (todayNormalized >= startDate) {
    return null;
  }

  return diffInDays(startDate, todayNormalized);
}

/**
 * Get parcours start and end dates
 */
export function getParcoursDates(): { start: string; end: string } {
  return {
    start: PARCOURS_START,
    end: PARCOURS_END,
  };
}
