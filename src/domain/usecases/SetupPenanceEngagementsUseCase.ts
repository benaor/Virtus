/**
 * SetupPenanceEngagementsUseCase
 * Sets up the 5 penance engagements during onboarding
 */

import type { EngagementRepository } from '../repositories/EngagementRepository';
import type { SettingsRepository } from '../repositories/SettingsRepository';

export class SetupPenanceEngagementsUseCase {
  constructor(
    private engagementRepository: EngagementRepository,
    private settingsRepository: SettingsRepository
  ) {}

  async execute(titles: string[]): Promise<void> {
    // Validate exactly 5 penance engagements
    if (titles.length !== 5) {
      throw new Error(`Expected exactly 5 penance engagements, got ${titles.length}`);
    }

    // Validate no empty titles
    const emptyTitles = titles.filter((t) => !t.trim());
    if (emptyTitles.length > 0) {
      throw new Error('Penance engagement titles cannot be empty');
    }

    // Create the penance engagements
    const engagements = titles.map((title) => ({ title: title.trim() }));
    await this.engagementRepository.addPenanceEngagements(engagements);

    // Mark onboarding as completed
    await this.settingsRepository.setOnboardingCompleted();
  }
}
