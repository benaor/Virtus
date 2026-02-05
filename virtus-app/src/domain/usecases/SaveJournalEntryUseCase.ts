/**
 * SaveJournalEntryUseCase
 * Saves a new journal entry (examen, graces, or notes)
 */

import type { JournalEntry, JournalEntryType } from '../entities';
import type { JournalRepository } from '../repositories/JournalRepository';

export interface SaveJournalEntryInput {
  date: string;
  type: JournalEntryType;
  step?: number;
  content: string;
}

export class SaveJournalEntryUseCase {
  constructor(private journalRepository: JournalRepository) {}

  async execute(input: SaveJournalEntryInput): Promise<JournalEntry> {
    return this.journalRepository.saveEntry({
      date: input.date,
      type: input.type,
      step: input.step ?? null,
      content: input.content,
    });
  }
}
