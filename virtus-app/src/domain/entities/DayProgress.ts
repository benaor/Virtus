/**
 * DayProgress Entity
 * Aggregated progress for a single day across all categories
 */

import type { EngagementCategory } from './Engagement';

export type CategoryProgress = {
  category: EngagementCategory;
  checked: number;
  total: number;
  percentage: number;
};

export type DayProgress = {
  day: number; // 1-70
  date: string; // YYYY-MM-DD
  spiritual: CategoryProgress;
  virtue: CategoryProgress;
  penance: CategoryProgress;
  overall: CategoryProgress;
};
