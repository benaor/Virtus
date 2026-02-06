/**
 * useExamen Hook
 * Manages the 5 examen steps + graces journal entries
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { JournalEntry } from '@domain/entities';
import {
  getJournalRepository,
  getSaveJournalEntryUseCase,
  getToggleEngagementCheckUseCase,
  getEngagementRepository,
} from '@core/di/container';

const EXAMEN_STEPS_COUNT = 5;
const DEBOUNCE_MS = 500;

interface UseExamenResult {
  /** Content for each examen step (1-5) */
  stepContents: Map<number, string>;
  /** Content for graces */
  gracesContent: string;
  /** Whether data is loading */
  isLoading: boolean;
  /** Map of step -> isSaving */
  savingSteps: Map<number, boolean>;
  /** Whether graces is saving */
  isSavingGraces: boolean;
  /** Error message if any */
  error: string | null;
  /** Update a step's content (triggers debounced save) */
  updateStep: (step: number, content: string) => void;
  /** Update graces content (triggers debounced save) */
  updateGraces: (content: string) => void;
  /** Finish examen: check the engagement and close */
  finishExamen: () => Promise<void>;
}

export function useExamen(date: string): UseExamenResult {
  const [stepContents, setStepContents] = useState<Map<number, string>>(new Map());
  const [gracesContent, setGracesContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingSteps, setSavingSteps] = useState<Map<number, boolean>>(new Map());
  const [isSavingGraces, setIsSavingGraces] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timers
  const stepTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const gracesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing entries
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const journalRepo = getJournalRepository();
      const entries = await journalRepo.getEntriesForDate(date);

      // Build step contents map
      const stepsMap = new Map<number, string>();
      for (let i = 1; i <= EXAMEN_STEPS_COUNT; i++) {
        stepsMap.set(i, '');
      }

      let graces = '';

      entries.forEach((entry: JournalEntry) => {
        if (entry.type === 'examen' && entry.step !== null) {
          stepsMap.set(entry.step, entry.content ?? '');
        } else if (entry.type === 'graces') {
          graces = entry.content ?? '';
        }
      });

      setStepContents(stepsMap);
      setGracesContent(graces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save a step
  const saveStep = useCallback(async (step: number, content: string) => {
    setSavingSteps((prev) => new Map(prev).set(step, true));
    try {
      const saveUseCase = getSaveJournalEntryUseCase();
      await saveUseCase.execute({
        date,
        type: 'examen',
        step,
        content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setSavingSteps((prev) => new Map(prev).set(step, false));
    }
  }, [date]);

  // Save graces
  const saveGraces = useCallback(async (content: string) => {
    setIsSavingGraces(true);
    try {
      const saveUseCase = getSaveJournalEntryUseCase();
      await saveUseCase.execute({
        date,
        type: 'graces',
        content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setIsSavingGraces(false);
    }
  }, [date]);

  // Update step with debounce
  const updateStep = useCallback((step: number, content: string) => {
    setStepContents((prev) => new Map(prev).set(step, content));

    // Clear existing timer for this step
    const existingTimer = stepTimersRef.current.get(step);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced save
    const timer = setTimeout(() => {
      saveStep(step, content);
    }, DEBOUNCE_MS);
    stepTimersRef.current.set(step, timer);
  }, [saveStep]);

  // Update graces with debounce
  const updateGraces = useCallback((content: string) => {
    setGracesContent(content);

    // Clear existing timer
    if (gracesTimerRef.current) {
      clearTimeout(gracesTimerRef.current);
    }

    // Set new debounced save
    gracesTimerRef.current = setTimeout(() => {
      saveGraces(content);
    }, DEBOUNCE_MS);
  }, [saveGraces]);

  // Finish examen: check the "Examen de conscience" engagement
  const finishExamen = useCallback(async () => {
    try {
      const engagementRepo = getEngagementRepository();
      const toggleUseCase = getToggleEngagementCheckUseCase();

      // Find the "Examen de conscience" engagement
      const engagements = await engagementRepo.getActive();
      const examenEngagement = engagements.find(
        (e) => e.title.toLowerCase().includes('examen')
      );

      if (examenEngagement) {
        await toggleUseCase.execute(examenEngagement.id, date);
      }
    } catch (err) {
      // Silently fail - the examen is still completed
      console.warn('Failed to check examen engagement:', err);
    }
  }, [date]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      stepTimersRef.current.forEach((timer) => clearTimeout(timer));
      if (gracesTimerRef.current) {
        clearTimeout(gracesTimerRef.current);
      }
    };
  }, []);

  return {
    stepContents,
    gracesContent,
    isLoading,
    savingSteps,
    isSavingGraces,
    error,
    updateStep,
    updateGraces,
    finishExamen,
  };
}
