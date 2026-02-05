/**
 * SQLiteJournalRepository
 * Implements JournalRepository using SQLite
 */

import type { JournalEntry } from '@domain/entities';
import type { JournalRepository } from '@domain/repositories';
import type { SQLiteDatabase, JournalEntryRow } from '../datasources/SQLiteDatabase';
import { JournalEntryMapper } from '../mappers/JournalEntryMapper';

// Use crypto.randomUUID for ID generation
const generateId = (): string => {
  // crypto.randomUUID is available in React Native
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export class SQLiteJournalRepository implements JournalRepository {
  constructor(private db: SQLiteDatabase) {}

  async getEntriesForDate(date: string): Promise<JournalEntry[]> {
    const rows = this.db.getJournalEntries(date);
    return JournalEntryMapper.toDomainList(rows);
  }

  async getExamenForDate(date: string): Promise<JournalEntry[]> {
    const rows = this.db.getJournalEntriesByType(date, 'examen');
    return JournalEntryMapper.toDomainList(rows);
  }

  async saveEntry(
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JournalEntry> {
    const id = generateId();
    const now = new Date();

    this.db.upsertJournalEntry({
      id,
      date: entry.date,
      type: entry.type,
      step: entry.step,
      content: entry.content,
    });

    return {
      id,
      date: entry.date,
      type: entry.type,
      step: entry.step,
      content: entry.content,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateEntry(id: string, content: string): Promise<JournalEntry> {
    const db = this.db.getDatabase();
    const now = new Date().toISOString();

    db.runSync('UPDATE journal_entries SET content = ?, updated_at = ? WHERE id = ?', [
      content,
      now,
      id,
    ]);

    const row = db.getFirstSync<JournalEntryRow>(
      'SELECT * FROM journal_entries WHERE id = ?',
      [id]
    );

    if (!row) {
      throw new Error(`Journal entry with id ${id} not found`);
    }

    return JournalEntryMapper.toDomain(row);
  }
}
