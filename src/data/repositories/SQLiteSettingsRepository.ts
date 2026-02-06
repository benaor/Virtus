/**
 * SQLiteSettingsRepository
 * Implements SettingsRepository using SQLite
 */

import type { SettingsRepository } from '@domain/repositories';
import type { SQLiteDatabase } from '../datasources/SQLiteDatabase';

const ONBOARDING_KEY = 'onboarding_completed';

export class SQLiteSettingsRepository implements SettingsRepository {
  constructor(private db: SQLiteDatabase) {}

  async get(key: string): Promise<string | null> {
    return this.db.getSetting(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.db.setSetting(key, value);
  }

  async hasCompletedOnboarding(): Promise<boolean> {
    const value = await this.get(ONBOARDING_KEY);
    return value === 'true';
  }

  async setOnboardingCompleted(): Promise<void> {
    await this.set(ONBOARDING_KEY, 'true');
  }
}
