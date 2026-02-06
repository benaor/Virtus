/**
 * JournalRepository Interface
 * Contract for journal entry data access
 */

import type { JournalEntry } from '../entities';

export interface JournalRepository {
  getEntriesForDate(date: string): Promise<JournalEntry[]>;
  getExamenForDate(date: string): Promise<JournalEntry[]>;
  saveEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry>;
  updateEntry(id: string, content: string): Promise<JournalEntry>;
}
