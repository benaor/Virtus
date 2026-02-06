/**
 * StaticContentRepository
 * Implements ContentRepository using static JSON files
 */

import type { Formation, Exhortation } from '@domain/entities';
import type { ContentRepository } from '@domain/repositories';

// Import static content
import formationsData from '@content/formations.json';
import exhortationsData from '@content/exhortations.json';

// Type the imported data
const formations = formationsData as Formation[];
const exhortations = exhortationsData as Exhortation[];

// Create lookup maps for O(1) access
const formationsMap = new Map<number, Formation>(
  formations.map((f) => [f.day, f])
);

const exhortationsMap = new Map<number, Exhortation>(
  exhortations.map((e) => [e.day, e])
);

export class StaticContentRepository implements ContentRepository {
  getFormation(day: number): Formation | null {
    return formationsMap.get(day) ?? null;
  }

  getExhortation(day: number): Exhortation | null {
    return exhortationsMap.get(day) ?? null;
  }
}
