/**
 * ToggleEngagementCheckUseCase
 * Toggles the completion status of an engagement for a specific date
 */

import type { DailyCheck } from '../entities';
import type { DailyCheckRepository } from '../repositories/DailyCheckRepository';

export class ToggleEngagementCheckUseCase {
  constructor(private dailyCheckRepository: DailyCheckRepository) {}

  async execute(engagementId: string, date: string): Promise<DailyCheck> {
    return this.dailyCheckRepository.toggleCheck(engagementId, date);
  }
}
