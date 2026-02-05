/**
 * EngagementRepository Interface
 * Contract for engagement data access
 */

import type { Engagement, EngagementCategory } from '../entities';

export interface EngagementRepository {
  getAll(): Promise<Engagement[]>;
  getByCategory(category: EngagementCategory): Promise<Engagement[]>;
  getActive(): Promise<Engagement[]>;
  addPenanceEngagements(engagements: Pick<Engagement, 'title'>[]): Promise<void>;
  hasPenanceEngagements(): Promise<boolean>;
}
