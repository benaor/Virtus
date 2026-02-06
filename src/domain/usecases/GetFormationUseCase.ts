/**
 * GetFormationUseCase
 * Retrieves the formation content for a specific day
 */

import type { Formation } from '../entities';
import type { ContentRepository } from '../repositories/ContentRepository';

export class GetFormationUseCase {
  constructor(private contentRepository: ContentRepository) {}

  execute(day: number): Formation | null {
    return this.contentRepository.getFormation(day);
  }
}
