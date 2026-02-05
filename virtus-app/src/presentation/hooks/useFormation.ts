/**
 * useFormation Hook
 * Fetches formation and journal entry for a specific day
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Formation, JournalEntry } from '@domain/entities';
import {
  getGetFormationUseCase,
  getSaveJournalEntryUseCase,
  getJournalRepository,
} from '@core/di/container';
import { getDayDate } from '@domain/entities/Parcours';

interface UseFormationResult {
  /** The formation for the day */
  formation: Formation | null;
  /** The journal entry for notes */
  journalEntry: JournalEntry | null;
  /** Current note content */
  noteContent: string;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether note is saving */
  isSaving: boolean;
  /** Error message if any */
  error: string | null;
  /** Update note content (triggers debounced save) */
  updateNote: (content: string) => void;
}

/**
 * Format a Date to ISO string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useFormation(day: number): UseFormationResult {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the date for this day
  const dateForDay = formatDateISO(getDayDate(day));

  // Load formation and journal entry
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formationUseCase = getGetFormationUseCase();
      const journalRepo = getJournalRepository();

      const [loadedFormation, allEntries] = await Promise.all([
        formationUseCase.execute(day),
        journalRepo.getEntriesForDate(dateForDay),
      ]);

      setFormation(loadedFormation);

      // Get the first notes entry for this day (if any)
      const notesEntries = allEntries.filter((e) => e.type === 'notes');
      const existingEntry = notesEntries.length > 0 ? notesEntries[0] : null;
      setJournalEntry(existingEntry);
      setNoteContent(existingEntry?.content ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [day, dateForDay]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save note with debounce
  const saveNote = useCallback(async (content: string) => {
    if (content === journalEntry?.content) return;

    setIsSaving(true);
    try {
      const saveUseCase = getSaveJournalEntryUseCase();
      const savedEntry = await saveUseCase.execute({
        date: dateForDay,
        type: 'notes',
        content,
      });
      setJournalEntry(savedEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }, [dateForDay, journalEntry?.content]);

  // Update note with debounce
  const updateNote = useCallback((content: string) => {
    setNoteContent(content);

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new debounced save
    saveTimerRef.current = setTimeout(() => {
      saveNote(content);
    }, 500);
  }, [saveNote]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    formation,
    journalEntry,
    noteContent,
    isLoading,
    isSaving,
    error,
    updateNote,
  };
}
