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

  async replacePenanceEngagements(engagements: Pick<Engagement, 'title'>[]): Promise<void> {
    const db = this.db.getDatabase();
    const baseOrder = 10; // Start after fixed engagements

    db.withTransactionSync(() => {
      // Get existing penances
      const existing = this.db.getEngagementsByCategory('penance');

      // Build maps for efficient lookup
      const existingByTitle = new Map(existing.map(e => [e.title, e]));
      const newTitles = new Set(engagements.map(e => e.title));

      // Process new titles
      engagements.forEach((engagement, index) => {
        const existingEngagement = existingByTitle.get(engagement.title);

        if (existingEngagement) {
          // Title exists: keep it, reactivate if needed, update sort order
          this.db.updateEngagement(existingEngagement.id, true, baseOrder + index);
        } else {
          // New title: insert it
          const id = `penance-${Date.now()}-${index}`;
          this.db.insertEngagement({
            id,
            category: 'penance',
            title: engagement.title,
            sort_order: baseOrder + index,
          });
        }
      });

      // Deactivate titles that are no longer selected
      existing.forEach((engagement) => {
        if (!newTitles.has(engagement.title)) {
          this.db.updateEngagementActive(engagement.id, false);
        }
      });
    });
  }

  async hasPenanceEngagements(): Promise<boolean> {
    const penanceEngagements = await this.getByCategory('penance');
    return penanceEngagements.length > 0;
  }
}
