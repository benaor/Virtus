/**
 * SQLiteEngagementRepository
 * Implements EngagementRepository using SQLite
 */

import type { Engagement, EngagementCategory } from '@domain/entities';
import type { EngagementRepository } from '@domain/repositories';
import type { SQLiteDatabase } from '../datasources/SQLiteDatabase';
import { EngagementMapper } from '../mappers/EngagementMapper';

export class SQLiteEngagementRepository implements EngagementRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<Engagement[]> {
    const rows = this.db.getAllEngagements();
    return EngagementMapper.toDomainList(rows);
  }

  async getByCategory(category: EngagementCategory): Promise<Engagement[]> {
    const rows = this.db.getEngagementsByCategory(category);
    return EngagementMapper.toDomainList(rows);
  }

  async getActive(): Promise<Engagement[]> {
    const rows = this.db.getActiveEngagements();
    return EngagementMapper.toDomainList(rows);
  }

  async addPenanceEngagements(engagements: Pick<Engagement, 'title'>[]): Promise<void> {
    const db = this.db.getDatabase();
    const baseOrder = 10; // Start after fixed engagements

    db.withTransactionSync(() => {
      engagements.forEach((engagement, index) => {
        const id = `penance-${Date.now()}-${index}`;
        this.db.insertEngagement({
          id,
          category: 'penance',
          title: engagement.title,
          sort_order: baseOrder + index,
        });
      });
    });
  }

  async hasPenanceEngagements(): Promise<boolean> {
    const penanceEngagements = await this.getByCategory('penance');
    return penanceEngagements.length > 0;
  }
}
