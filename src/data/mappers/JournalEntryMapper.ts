/**
 * JournalEntryMapper
 * Maps between SQLite rows and JournalEntry entities
 */

import type { JournalEntry } from '@domain/entities';
import type { JournalEntryRow } from '../datasources/SQLiteDatabase';

export class JournalEntryMapper {
  static toDomain(row: JournalEntryRow): JournalEntry {
    return {
      id: row.id,
      date: row.date,
      type: row.type,
      step: row.step,
      content: row.content ?? '',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  static toDomainList(rows: JournalEntryRow[]): JournalEntry[] {
    return rows.map(JournalEntryMapper.toDomain);
  }
}
