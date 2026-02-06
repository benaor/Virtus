/**
 * Virtus Parcours Constants
 * 70-day journey from February 16 to April 26, 2025
 */

export type Period = {
  name: string;
  startDay: number; // 1-based day in the parcours
  endDay: number;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string; // ISO format YYYY-MM-DD
};

/** Parcours start date (ISO format) */
export const PARCOURS_START = '2025-02-16';

/** Parcours end date (ISO format) */
export const PARCOURS_END = '2025-04-26';

/** Total number of days in the parcours */
export const TOTAL_DAYS = 70;

/** The three periods of the parcours */
export const PERIODS: readonly Period[] = [
  {
    name: 'Pré-Carême',
    startDay: 1,
    endDay: 17,
    startDate: '2025-02-16',
    endDate: '2025-03-04',
  },
  {
    name: 'Carême',
    startDay: 18,
    endDay: 63,
    startDate: '2025-03-05',
    endDate: '2025-04-19',
  },
  {
    name: 'Octave de Pâques',
    startDay: 64,
    endDay: 70,
    startDate: '2025-04-20',
    endDate: '2025-04-26',
  },
] as const;
