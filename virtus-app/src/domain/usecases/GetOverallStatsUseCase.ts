/**
 * GetOverallStatsUseCase
 * Calculates overall fidelity percentage per category since parcours start
 */

import type { EngagementCategory } from '../entities';
import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';
import { PARCOURS_START, PARCOURS_END } from '@core/constants/parcours';
import { getCurrentDay } from '../entities/Parcours';

export interface OverallStats {
  spiritual: number;
  virtue: number;
  penance: number;
}

export class GetOverallStatsUseCase {
  constructor(
    private engagementRepository: EngagementRepository,
    private dailyCheckRepository: DailyCheckRepository
  ) {}

  async execute(): Promise<OverallStats> {
    const today = new Date();
    const currentDay = getCurrentDay(today);

    // If parcours hasn't started or has ended, return 0 for all
    if (currentDay === null) {
      return { spiritual: 0, virtue: 0, penance: 0 };
    }

    // Calculate end date (today or parcours end, whichever is earlier)
    const todayStr = today.toISOString().split('T')[0];
    const endDate = todayStr < PARCOURS_END ? todayStr : PARCOURS_END;

    const [engagements, checks] = await Promise.all([
      this.engagementRepository.getActive(),
      this.dailyCheckRepository.getChecksForDateRange(PARCOURS_START, endDate),
    ]);

    // Group engagements by category
    const engagementsByCategory = new Map<EngagementCategory, string[]>();
    engagementsByCategory.set('spiritual', []);
    engagementsByCategory.set('virtue', []);
    engagementsByCategory.set('penance', []);

    for (const engagement of engagements) {
      engagementsByCategory.get(engagement.category)!.push(engagement.id);
    }

    // Create check lookup: engagementId -> Set of dates checked
    const checkLookup = new Map<string, Set<string>>();
    for (const check of checks) {
      if (check.checked) {
        if (!checkLookup.has(check.engagementId)) {
          checkLookup.set(check.engagementId, new Set());
        }
        checkLookup.get(check.engagementId)!.add(check.date);
      }
    }

    // Calculate fidelity for each category
    const calculateCategoryFidelity = (category: EngagementCategory): number => {
      const engagementIds = engagementsByCategory.get(category)!;
      if (engagementIds.length === 0) {
        return 0;
      }

      // Total possible checks = number of engagements * number of days
      const totalPossible = engagementIds.length * currentDay;
      if (totalPossible === 0) {
        return 0;
      }

      // Count actual checks
      let totalChecked = 0;
      for (const engagementId of engagementIds) {
        const checkedDates = checkLookup.get(engagementId);
        if (checkedDates) {
          totalChecked += checkedDates.size;
        }
      }

      return Math.round((totalChecked / totalPossible) * 100);
    };

    return {
      spiritual: calculateCategoryFidelity('spiritual'),
      virtue: calculateCategoryFidelity('virtue'),
      penance: calculateCategoryFidelity('penance'),
    };
  }
}
