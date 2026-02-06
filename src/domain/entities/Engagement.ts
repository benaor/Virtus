/**
 * Engagement Entity
 * Represents a daily commitment (spiritual, virtue, or penance)
 */

export type EngagementCategory = 'spiritual' | 'virtue' | 'penance';

export type Engagement = {
  id: string;
  category: EngagementCategory;
  title: string;
  isCustom: boolean;
  isActive: boolean;
  sortOrder: number;
};
