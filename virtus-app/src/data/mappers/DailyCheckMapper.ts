/**
 * DailyCheckMapper
 * Maps between SQLite rows and DailyCheck entities
 */

import type { DailyCheck } from '@domain/entities';
import type { DailyCheckRow } from '../datasources/SQLiteDatabase';

export class DailyCheckMapper {
  static toDomain(row: DailyCheckRow): DailyCheck {
    return {
      engagementId: row.engagement_id,
      date: row.date,
      checked: row.checked === 1,
      checkedAt: row.checked_at ? new Date(row.checked_at) : null,
    };
  }

  static toDomainList(rows: DailyCheckRow[]): DailyCheck[] {
    return rows.map(DailyCheckMapper.toDomain);
  }
}
