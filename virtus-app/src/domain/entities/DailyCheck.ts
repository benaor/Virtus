/**
 * DailyCheck Entity
 * Tracks completion of an engagement for a specific day
 */

export type DailyCheck = {
  engagementId: string;
  date: string; // YYYY-MM-DD
  checked: boolean;
  checkedAt: Date | null;
};
