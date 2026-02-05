/**
 * GetDayProgressUseCase
 * Calculates daily progress across all engagement categories
 */

import type { DayProgress, CategoryProgress, EngagementCategory } from '../entities';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';
import { getCurrentDay } from '../entities/Parcours';

export class GetDayProgressUseCase {
  constructor(
    private engagementRepository: EngagementRepository,
    private dailyCheckRepository: DailyCheckRepository
  ) {}

  async execute(date: string): Promise<DayProgress> {
    const [engagements, checks] = await Promise.all([
      this.engagementRepository.getActive(),
      this.dailyCheckRepository.getChecksForDate(date),
    ]);

    const checkMap = new Map(checks.map((c) => [c.engagementId, c.checked]));

    const calculateCategoryProgress = (category: EngagementCategory): CategoryProgress => {
      const categoryEngagements = engagements.filter((e) => e.category === category);
      const total = categoryEngagements.length;
      const checked = categoryEngagements.filter((e) => checkMap.get(e.id) === true).length;
      const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

      return { category, checked, total, percentage };
    };

    const spiritual = calculateCategoryProgress('spiritual');
    const virtue = calculateCategoryProgress('virtue');
    const penance = calculateCategoryProgress('penance');

    const overallTotal = spiritual.total + virtue.total + penance.total;
    const overallChecked = spiritual.checked + virtue.checked + penance.checked;
    const overall: CategoryProgress = {
      category: 'spiritual', // placeholder, not really used
      checked: overallChecked,
      total: overallTotal,
      percentage: overallTotal > 0 ? Math.round((overallChecked / overallTotal) * 100) : 0,
    };

    const dateObj = new Date(date + 'T12:00:00Z');
    const day = getCurrentDay(dateObj) ?? 0;

    return {
      day,
      date,
      spiritual,
      virtue,
      penance,
      overall,
    };
  }
}
