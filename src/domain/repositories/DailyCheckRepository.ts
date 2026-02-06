/**
 * DailyCheckRepository Interface
 * Contract for daily check data access
 */

import type { DailyCheck } from '../entities';

export interface DailyCheckRepository {
  getChecksForDate(date: string): Promise<DailyCheck[]>;
  toggleCheck(engagementId: string, date: string): Promise<DailyCheck>;
  getChecksForDateRange(startDate: string, endDate: string): Promise<DailyCheck[]>;
  getStreak(): Promise<number>; // Consecutive days with 100% completion
}
