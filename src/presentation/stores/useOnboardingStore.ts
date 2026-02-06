/**
 * useOnboardingStore
 * Zustand store for managing onboarding completion state
 */

import { create } from 'zustand';
import { container } from '@core/di/container';

interface OnboardingState {
  /** Whether the user has completed onboarding, null if not yet initialized */
  hasCompletedOnboarding: boolean | null;
  /** Initialize the onboarding state from database */
  initialize: () => Promise<void>;
  /** Mark onboarding as completed (updates store immediately, database is handled separately) */
  setCompleted: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: null,

  initialize: async () => {
    const settingsRepo = container.getSettingsRepository();
    const completed = await settingsRepo.hasCompletedOnboarding();
    set({ hasCompletedOnboarding: completed });
  },

  setCompleted: () => {
    set({ hasCompletedOnboarding: true });
  },
}));
