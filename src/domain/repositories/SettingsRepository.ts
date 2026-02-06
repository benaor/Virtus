/**
 * SettingsRepository Interface
 * Contract for user settings data access
 */

export interface SettingsRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  hasCompletedOnboarding(): Promise<boolean>;
  setOnboardingCompleted(): Promise<void>;
}
