/**
 * useEngagementStore
 * Zustand store for triggering engagement data refreshes
 */

import { create } from 'zustand';

interface EngagementState {
  /** Version counter that increments on engagement changes */
  version: number;
}

interface EngagementActions {
  /** Increment version to trigger re-fetch in dependent hooks */
  invalidate: () => void;
}

type EngagementStore = EngagementState & EngagementActions;

export const useEngagementStore = create<EngagementStore>((set) => ({
  version: 0,
  invalidate: () => set((state) => ({ version: state.version + 1 })),
}));
