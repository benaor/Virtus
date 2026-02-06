/**
 * Virtus Parcours Constants
 * 70-day journey from February 1 to April 11, 2026
 */

export type Period = {
  name: string;
  startDay: number; // 1-based day in the parcours
  endDay: number;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string; // ISO format YYYY-MM-DD
};

/** Parcours start date (ISO format) */
export const PARCOURS_START = '2026-02-01';

/** Parcours end date (ISO format) */
export const PARCOURS_END = '2026-04-11';

/** Total number of days in the parcours */
export const TOTAL_DAYS = 70;

/** The three periods of the parcours */
export const PERIODS: readonly Period[] = [
  {
    name: 'Pré-Carême',
    startDay: 1,
    endDay: 17,
    startDate: '2026-02-01',
    endDate: '2026-02-17',
  },
  {
    name: 'Carême',
    startDay: 18,
    endDay: 63,
    startDate: '2026-02-18',
    endDate: '2026-04-04',
  },
  {
    name: 'Octave de Pâques',
    startDay: 64,
    endDay: 70,
    startDate: '2026-04-05',
    endDate: '2026-04-11',
  },
] as const;
