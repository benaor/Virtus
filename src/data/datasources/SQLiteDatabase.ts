import { openDatabaseSync, type SQLiteDatabase as ExpoSQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'virtus.db';

// Engagement categories
export type EngagementCategory = 'spiritual' | 'virtue' | 'penance';

// Journal entry types
export type JournalEntryType = 'examen' | 'graces' | 'notes';

// Database row types
export interface EngagementRow {
  id: string;
  category: EngagementCategory;
  title: string;
  is_custom: number;
  is_active: number;
  sort_order: number;
}

export interface DailyCheckRow {
  id: string;
  engagement_id: string;
  date: string;
  checked: number;
  checked_at: string | null;
}

export interface JournalEntryRow {
  id: string;
  date: string;
  type: JournalEntryType;
  step: number | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingRow {
  key: string;
  value: string;
}

// Fixed engagements data
const FIXED_ENGAGEMENTS: Omit<EngagementRow, 'is_custom' | 'is_active'>[] = [
  // Spiritual engagements
  { id: 'spiritual-1', category: 'spiritual', title: 'Chapelet', sort_order: 0 },
  { id: 'spiritual-2', category: 'spiritual', title: 'Oraison (30 min)', sort_order: 1 },
  { id: 'spiritual-3', category: 'spiritual', title: 'Formation du jour', sort_order: 2 },
  { id: 'spiritual-4', category: 'spiritual', title: 'Examen de conscience', sort_order: 3 },
  { id: 'spiritual-5', category: 'spiritual', title: 'Messe/Adoration (sem.)', sort_order: 4 },
  // Virtue engagements
  { id: 'virtue-1', category: 'virtue', title: 'Pas d\'écrans inutiles', sort_order: 5 },
  { id: 'virtue-2', category: 'virtue', title: '7h de sommeil', sort_order: 6 },
  { id: 'virtue-3', category: 'virtue', title: 'Activité physique (2h/sem.)', sort_order: 7 },
  { id: 'virtue-4', category: 'virtue', title: 'Pas de grignotage', sort_order: 8 },
  { id: 'virtue-5', category: 'virtue', title: 'Service (1h/sem.)', sort_order: 9 },
];

/**
 * SQLite database wrapper for Virtus app
 * Uses expo-sqlite synchronous API
 */
export class SQLiteDatabase {
  private db: ExpoSQLiteDatabase | null = null;
  private initialized = false;

  /**
   * Get the underlying database instance
   * @throws Error if database is not initialized
   */
  getDatabase(): ExpoSQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the database and create tables
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.db = openDatabaseSync(DATABASE_NAME);

    this.createTables();
    this.initialized = true;
  }

  /**
   * Create all database tables
   */
  private createTables(): void {
    const db = this.getDatabase();

    db.execSync(`
      CREATE TABLE IF NOT EXISTS engagements (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        is_custom INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS daily_checks (
        id TEXT PRIMARY KEY,
        engagement_id TEXT NOT NULL,
        date TEXT NOT NULL,
        checked INTEGER DEFAULT 0,
        checked_at TEXT,
        UNIQUE(engagement_id, date)
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        step INTEGER,
        content TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_daily_checks_date ON daily_checks(date);
      CREATE INDEX IF NOT EXISTS idx_daily_checks_engagement ON daily_checks(engagement_id);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_type ON journal_entries(type);
      CREATE INDEX IF NOT EXISTS idx_engagements_category ON engagements(category);
    `);
  }

  /**
   * Seed the database with fixed engagements
   * Only inserts if engagements table is empty
   */
  seed(): void {
    const db = this.getDatabase();

    // Check if engagements already exist
    const count = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM engagements WHERE is_custom = 0'
    );

    if (count && count.count > 0) {
      return; // Already seeded
    }

    // Insert fixed engagements
    const stmt = db.prepareSync(
      'INSERT OR IGNORE INTO engagements (id, category, title, is_custom, is_active, sort_order) VALUES (?, ?, ?, 0, 1, ?)'
    );

    try {
      for (const engagement of FIXED_ENGAGEMENTS) {
        stmt.executeSync([
          engagement.id,
          engagement.category,
          engagement.title,
          engagement.sort_order,
        ]);
      }
    } finally {
      stmt.finalizeSync();
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.closeSync();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * Reset the database (for testing purposes)
   * WARNING: This will delete all data
   */
  reset(): void {
    const db = this.getDatabase();

    db.execSync(`
      DROP TABLE IF EXISTS engagements;
      DROP TABLE IF EXISTS daily_checks;
      DROP TABLE IF EXISTS journal_entries;
      DROP TABLE IF EXISTS user_settings;
    `);

    this.createTables();
  }

  // ==================== Engagement Methods ====================

  /**
   * Get all engagements
   */
  getAllEngagements(): EngagementRow[] {
    const db = this.getDatabase();
    return db.getAllSync<EngagementRow>(
      'SELECT * FROM engagements ORDER BY sort_order ASC'
    );
  }

  /**
   * Get engagements by category
   */
  getEngagementsByCategory(category: EngagementCategory): EngagementRow[] {
    const db = this.getDatabase();
    return db.getAllSync<EngagementRow>(
      'SELECT * FROM engagements WHERE category = ? ORDER BY sort_order ASC',
      [category]
    );
  }

  /**
   * Get active engagements
   */
  getActiveEngagements(): EngagementRow[] {
    const db = this.getDatabase();
    return db.getAllSync<EngagementRow>(
      'SELECT * FROM engagements WHERE is_active = 1 ORDER BY sort_order ASC'
    );
  }

  /**
   * Insert a custom engagement (penance)
   */
  insertEngagement(engagement: Omit<EngagementRow, 'is_custom' | 'is_active'>): void {
    const db = this.getDatabase();
    db.runSync(
      'INSERT INTO engagements (id, category, title, is_custom, is_active, sort_order) VALUES (?, ?, ?, 1, 1, ?)',
      [engagement.id, engagement.category, engagement.title, engagement.sort_order]
    );
  }

  /**
   * Delete all engagements by category
   */
  deleteEngagementsByCategory(category: EngagementCategory): void {
    const db = this.getDatabase();
    db.runSync('DELETE FROM engagements WHERE category = ?', [category]);
  }

  /**
   * Update engagement active status
   */
  updateEngagementActive(id: string, isActive: boolean): void {
    const db = this.getDatabase();
    db.runSync(
      'UPDATE engagements SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
  }

  // ==================== Daily Check Methods ====================

  /**
   * Get daily checks for a specific date
   */
  getDailyChecks(date: string): DailyCheckRow[] {
    const db = this.getDatabase();
    return db.getAllSync<DailyCheckRow>(
      'SELECT * FROM daily_checks WHERE date = ?',
      [date]
    );
  }

  /**
   * Toggle a daily check
   */
  toggleDailyCheck(engagementId: string, date: string): boolean {
    const db = this.getDatabase();
    const id = `${engagementId}-${date}`;

    const existing = db.getFirstSync<DailyCheckRow>(
      'SELECT * FROM daily_checks WHERE engagement_id = ? AND date = ?',
      [engagementId, date]
    );

    if (existing) {
      const newChecked = existing.checked === 1 ? 0 : 1;
      const checkedAt = newChecked === 1 ? new Date().toISOString() : null;
      db.runSync(
        'UPDATE daily_checks SET checked = ?, checked_at = ? WHERE id = ?',
        [newChecked, checkedAt, existing.id]
      );
      return newChecked === 1;
    } else {
      db.runSync(
        'INSERT INTO daily_checks (id, engagement_id, date, checked, checked_at) VALUES (?, ?, ?, 1, ?)',
        [id, engagementId, date, new Date().toISOString()]
      );
      return true;
    }
  }

  // ==================== Journal Methods ====================

  /**
   * Get journal entries for a specific date
   */
  getJournalEntries(date: string): JournalEntryRow[] {
    const db = this.getDatabase();
    return db.getAllSync<JournalEntryRow>(
      'SELECT * FROM journal_entries WHERE date = ? ORDER BY created_at ASC',
      [date]
    );
  }

  /**
   * Get journal entries by type
   */
  getJournalEntriesByType(date: string, type: JournalEntryType): JournalEntryRow[] {
    const db = this.getDatabase();
    return db.getAllSync<JournalEntryRow>(
      'SELECT * FROM journal_entries WHERE date = ? AND type = ? ORDER BY step ASC, created_at ASC',
      [date, type]
    );
  }

  /**
   * Insert or update a journal entry
   */
  upsertJournalEntry(entry: Omit<JournalEntryRow, 'created_at' | 'updated_at'>): void {
    const db = this.getDatabase();
    const now = new Date().toISOString();

    const existing = db.getFirstSync<JournalEntryRow>(
      'SELECT * FROM journal_entries WHERE id = ?',
      [entry.id]
    );

    if (existing) {
      db.runSync(
        'UPDATE journal_entries SET content = ?, updated_at = ? WHERE id = ?',
        [entry.content, now, entry.id]
      );
    } else {
      db.runSync(
        'INSERT INTO journal_entries (id, date, type, step, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [entry.id, entry.date, entry.type, entry.step, entry.content, now, now]
      );
    }
  }

  // ==================== Settings Methods ====================

  /**
   * Get a setting value
   */
  getSetting(key: string): string | null {
    const db = this.getDatabase();
    const result = db.getFirstSync<UserSettingRow>(
      'SELECT * FROM user_settings WHERE key = ?',
      [key]
    );
    return result?.value ?? null;
  }

  /**
   * Set a setting value
   */
  setSetting(key: string, value: string): void {
    const db = this.getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  /**
   * Delete a setting
   */
  deleteSetting(key: string): void {
    const db = this.getDatabase();
    db.runSync('DELETE FROM user_settings WHERE key = ?', [key]);
  }
}
