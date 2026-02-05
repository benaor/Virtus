/**
 * EngagementMapper
 * Maps between SQLite rows and Engagement entities
 */

import type { Engagement } from '@domain/entities';
import type { EngagementRow } from '../datasources/SQLiteDatabase';

export class EngagementMapper {
  static toDomain(row: EngagementRow): Engagement {
    return {
      id: row.id,
      category: row.category,
      title: row.title,
      isCustom: row.is_custom === 1,
      isActive: row.is_active === 1,
      sortOrder: row.sort_order,
    };
  }

  static toDomainList(rows: EngagementRow[]): Engagement[] {
    return rows.map(EngagementMapper.toDomain);
  }
}
