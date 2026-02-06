/**
 * ContentRepository Interface
 * Contract for static content access (formations, exhortations)
 */

import type { Formation, Exhortation } from '../entities';

export interface ContentRepository {
  getFormation(day: number): Formation | null;
  getExhortation(day: number): Exhortation | null;
}
