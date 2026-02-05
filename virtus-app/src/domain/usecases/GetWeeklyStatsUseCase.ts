/**
 * GetWeeklyStatsUseCase
 * Retrieves weekly statistics for all active engagements
 */

import type { Engagement } from '../entities';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';

export interface WeeklyEngagementStats {
  engagement: Engagement;
  days: boolean[]; // 7 booleans (Mon-Sun)
}

export class GetWeeklyStatsUseCase {
  constructor(
    private engagementRepository: EngagementRepository,
    private dailyCheckRepository: DailyCheckRepository
  ) {}

  async execute(weekStartDate: string): Promise<WeeklyEngagementStats[]> {
    // Calculate the 7 dates of the week (Monday to Sunday)
    const startDate = new Date(weekStartDate + 'T12:00:00Z');
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const endDate = dates[6];

    const [engagements, checks] = await Promise.all([
      this.engagementRepository.getActive(),
      this.dailyCheckRepository.getChecksForDateRange(weekStartDate, endDate),
    ]);

    // Create a map of engagementId -> date -> checked
    const checkMap = new Map<string, Map<string, boolean>>();
    for (const check of checks) {
      if (!checkMap.has(check.engagementId)) {
        checkMap.set(check.engagementId, new Map());
      }
      checkMap.get(check.engagementId)!.set(check.date, check.checked);
    }

    // Build the result
    return engagements.map((engagement) => {
      const engagementChecks = checkMap.get(engagement.id);
      const days = dates.map((date) => engagementChecks?.get(date) === true);

      return {
        engagement,
        days,
      };
    });
  }
}
