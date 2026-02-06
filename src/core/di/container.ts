import { SQLiteDatabase, NotificationService } from '@data/datasources';
import {
  SQLiteEngagementRepository,
  SQLiteDailyCheckRepository,
  SQLiteJournalRepository,
  SQLiteSettingsRepository,
  StaticContentRepository,
} from '@data/repositories';
import {
  GetDayProgressUseCase,
  ToggleEngagementCheckUseCase,
  GetFormationUseCase,
  GetExhortationUseCase,
  SaveJournalEntryUseCase,
  GetWeeklyStatsUseCase,
  SetupPenanceEngagementsUseCase,
  GetOverallStatsUseCase,
} from '@domain/usecases';

/**
 * Dependency Injection Container
 * Provides singleton instances of services, repositories, and use cases
 */
class Container {
  private static instance: Container;

  // Datasource
  private sqliteDatabase: SQLiteDatabase | null = null;

  // Services
  private notificationService: NotificationService | null = null;

  // Repositories
  private engagementRepository: SQLiteEngagementRepository | null = null;
  private dailyCheckRepository: SQLiteDailyCheckRepository | null = null;
  private journalRepository: SQLiteJournalRepository | null = null;
  private settingsRepository: SQLiteSettingsRepository | null = null;
  private contentRepository: StaticContentRepository | null = null;

  // Use Cases
  private getDayProgressUseCase: GetDayProgressUseCase | null = null;
  private toggleEngagementCheckUseCase: ToggleEngagementCheckUseCase | null = null;
  private getFormationUseCase: GetFormationUseCase | null = null;
  private getExhortationUseCase: GetExhortationUseCase | null = null;
  private saveJournalEntryUseCase: SaveJournalEntryUseCase | null = null;
  private getWeeklyStatsUseCase: GetWeeklyStatsUseCase | null = null;
  private setupPenanceEngagementsUseCase: SetupPenanceEngagementsUseCase | null = null;
  private getOverallStatsUseCase: GetOverallStatsUseCase | null = null;

  private constructor() {}

  /**
   * Get the singleton container instance
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // ========================================
  // Datasource
  // ========================================

  /**
   * Get the SQLite database instance
   * Initializes and seeds on first access
   */
  getDatabase(): SQLiteDatabase {
    if (!this.sqliteDatabase) {
      this.sqliteDatabase = new SQLiteDatabase();
      this.sqliteDatabase.initialize();
      this.sqliteDatabase.seed();
    }
    return this.sqliteDatabase;
  }

  // ========================================
  // Repositories
  // ========================================

  getEngagementRepository(): SQLiteEngagementRepository {
    if (!this.engagementRepository) {
      this.engagementRepository = new SQLiteEngagementRepository(this.getDatabase());
    }
    return this.engagementRepository;
  }

  getDailyCheckRepository(): SQLiteDailyCheckRepository {
    if (!this.dailyCheckRepository) {
      this.dailyCheckRepository = new SQLiteDailyCheckRepository(this.getDatabase());
    }
    return this.dailyCheckRepository;
  }

  getJournalRepository(): SQLiteJournalRepository {
    if (!this.journalRepository) {
      this.journalRepository = new SQLiteJournalRepository(this.getDatabase());
    }
    return this.journalRepository;
  }

  getSettingsRepository(): SQLiteSettingsRepository {
    if (!this.settingsRepository) {
      this.settingsRepository = new SQLiteSettingsRepository(this.getDatabase());
    }
    return this.settingsRepository;
  }

  getContentRepository(): StaticContentRepository {
    if (!this.contentRepository) {
      this.contentRepository = new StaticContentRepository();
    }
    return this.contentRepository;
  }

  // ========================================
  // Services
  // ========================================

  getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationService(this.getSettingsRepository());
    }
    return this.notificationService;
  }

  // ========================================
  // Use Cases
  // ========================================

  getGetDayProgressUseCase(): GetDayProgressUseCase {
    if (!this.getDayProgressUseCase) {
      this.getDayProgressUseCase = new GetDayProgressUseCase(
        this.getEngagementRepository(),
        this.getDailyCheckRepository()
      );
    }
    return this.getDayProgressUseCase;
  }

  getToggleEngagementCheckUseCase(): ToggleEngagementCheckUseCase {
    if (!this.toggleEngagementCheckUseCase) {
      this.toggleEngagementCheckUseCase = new ToggleEngagementCheckUseCase(
        this.getDailyCheckRepository()
      );
    }
    return this.toggleEngagementCheckUseCase;
  }

  getGetFormationUseCase(): GetFormationUseCase {
    if (!this.getFormationUseCase) {
      this.getFormationUseCase = new GetFormationUseCase(this.getContentRepository());
    }
    return this.getFormationUseCase;
  }

  getGetExhortationUseCase(): GetExhortationUseCase {
    if (!this.getExhortationUseCase) {
      this.getExhortationUseCase = new GetExhortationUseCase(this.getContentRepository());
    }
    return this.getExhortationUseCase;
  }

  getSaveJournalEntryUseCase(): SaveJournalEntryUseCase {
    if (!this.saveJournalEntryUseCase) {
      this.saveJournalEntryUseCase = new SaveJournalEntryUseCase(this.getJournalRepository());
    }
    return this.saveJournalEntryUseCase;
  }

  getGetWeeklyStatsUseCase(): GetWeeklyStatsUseCase {
    if (!this.getWeeklyStatsUseCase) {
      this.getWeeklyStatsUseCase = new GetWeeklyStatsUseCase(
        this.getEngagementRepository(),
        this.getDailyCheckRepository()
      );
    }
    return this.getWeeklyStatsUseCase;
  }

  getSetupPenanceEngagementsUseCase(): SetupPenanceEngagementsUseCase {
    if (!this.setupPenanceEngagementsUseCase) {
      this.setupPenanceEngagementsUseCase = new SetupPenanceEngagementsUseCase(
        this.getEngagementRepository(),
        this.getSettingsRepository()
      );
    }
    return this.setupPenanceEngagementsUseCase;
  }

  getGetOverallStatsUseCase(): GetOverallStatsUseCase {
    if (!this.getOverallStatsUseCase) {
      this.getOverallStatsUseCase = new GetOverallStatsUseCase(
        this.getEngagementRepository(),
        this.getDailyCheckRepository()
      );
    }
    return this.getOverallStatsUseCase;
  }

  /**
   * Reset the container (for testing purposes)
   */
  reset(): void {
    // Reset use cases
    this.getDayProgressUseCase = null;
    this.toggleEngagementCheckUseCase = null;
    this.getFormationUseCase = null;
    this.getExhortationUseCase = null;
    this.saveJournalEntryUseCase = null;
    this.getWeeklyStatsUseCase = null;
    this.setupPenanceEngagementsUseCase = null;
    this.getOverallStatsUseCase = null;

    // Reset services
    this.notificationService = null;

    // Reset repositories
    this.engagementRepository = null;
    this.dailyCheckRepository = null;
    this.journalRepository = null;
    this.settingsRepository = null;
    this.contentRepository = null;

    // Reset and close database
    if (this.sqliteDatabase) {
      this.sqliteDatabase.close();
      this.sqliteDatabase = null;
    }
  }
}

// Export singleton instance
export const container = Container.getInstance();

// ========================================
// Factory Functions
// ========================================

// Datasource
export const getDatabase = () => container.getDatabase();

// Services
export const getNotificationService = () => container.getNotificationService();

// Repositories
export const getEngagementRepository = () => container.getEngagementRepository();
export const getDailyCheckRepository = () => container.getDailyCheckRepository();
export const getJournalRepository = () => container.getJournalRepository();
export const getSettingsRepository = () => container.getSettingsRepository();
export const getContentRepository = () => container.getContentRepository();

// Use Cases
export const getGetDayProgressUseCase = () => container.getGetDayProgressUseCase();
export const getToggleEngagementCheckUseCase = () => container.getToggleEngagementCheckUseCase();
export const getGetFormationUseCase = () => container.getGetFormationUseCase();
export const getGetExhortationUseCase = () => container.getGetExhortationUseCase();
export const getSaveJournalEntryUseCase = () => container.getSaveJournalEntryUseCase();
export const getGetWeeklyStatsUseCase = () => container.getGetWeeklyStatsUseCase();
export const getSetupPenanceEngagementsUseCase = () => container.getSetupPenanceEngagementsUseCase();
export const getGetOverallStatsUseCase = () => container.getGetOverallStatsUseCase();
