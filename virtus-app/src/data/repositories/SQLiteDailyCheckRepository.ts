/**
 * SQLiteDailyCheckRepository
 * Implements DailyCheckRepository using SQLite
 */

import type { DailyCheck } from '@domain/entities';
import type { DailyCheckRepository } from '@domain/repositories';
import type { SQLiteDatabase, DailyCheckRow } from '../datasources/SQLiteDatabase';
import { DailyCheckMapper } from '../mappers/DailyCheckMapper';
import { PARCOURS_START } from '@core/constants/parcours';

export class SQLiteDailyCheckRepository implements DailyCheckRepository {
  constructor(private db: SQLiteDatabase) {}

  async getChecksForDate(date: string): Promise<DailyCheck[]> {
    const rows = this.db.getDailyChecks(date);
    return DailyCheckMapper.toDomainList(rows);
  }

  async toggleCheck(engagementId: string, date: string): Promise<DailyCheck> {
    const checked = this.db.toggleDailyCheck(engagementId, date);
    return {
      engagementId,
      date,
      checked,
      checkedAt: checked ? new Date() : null,
    };
  }

  async getChecksForDateRange(startDate: string, endDate: string): Promise<DailyCheck[]> {
    const db = this.db.getDatabase();
    const rows = db.getAllSync<DailyCheckRow>(
      'SELECT * FROM daily_checks WHERE date >= ? AND date <= ? ORDER BY date ASC',
      [startDate, endDate]
    );
    return DailyCheckMapper.toDomainList(rows);
  }

  async getStreak(): Promise<number> {
    const db = this.db.getDatabase();

    // Get all active engagements count
    const activeCount = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM engagements WHERE is_active = 1'
    );

    if (!activeCount || activeCount.count === 0) {
      return 0;
    }

    const totalEngagements = activeCount.count;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Find consecutive days where ALL engagements are checked
    // Starting from today and going backwards
    const result = db.getAllSync<{ date: string; checked_count: number }>(
      `SELECT date, COUNT(*) as checked_count
       FROM daily_checks
       WHERE checked = 1 AND date <= ? AND date >= ?
       GROUP BY date
       HAVING checked_count >= ?
       ORDER BY date DESC`,
      [today, PARCOURS_START, totalEngagements]
    );

    if (result.length === 0) {
      return 0;
    }

    // Count consecutive days
    let streak = 0;
    let expectedDate = new Date(today + 'T12:00:00Z');

    for (const row of result) {
      const rowDate = new Date(row.date + 'T12:00:00Z');
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (row.date === expectedDateStr) {
        streak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      } else {
        // Gap found, streak ends
        break;
      }
    }

    return streak;
  }
}
