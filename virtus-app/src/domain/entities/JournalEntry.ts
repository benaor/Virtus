/**
 * JournalEntry Entity
 * User's journal entries for examen, graces, and notes
 */

export type JournalEntryType = 'examen' | 'graces' | 'notes';

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  type: JournalEntryType;
  step: number | null; // For examen: steps 1-5
  content: string;
  createdAt: Date;
  updatedAt: Date;
};
