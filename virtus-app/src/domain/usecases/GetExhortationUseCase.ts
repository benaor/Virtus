/**
 * GetExhortationUseCase
 * Retrieves the exhortation content for a specific day
 */

import type { Exhortation } from '../entities';
import type { ContentRepository } from '../repositories/ContentRepository';

export class GetExhortationUseCase {
  constructor(private contentRepository: ContentRepository) {}

  execute(day: number): Exhortation | null {
    return this.contentRepository.getExhortation(day);
  }
}
