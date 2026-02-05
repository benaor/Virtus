import { SQLiteDatabase } from '@data/datasources';

/**
 * Dependency Injection Container
 * Provides singleton instances of services
 */
class Container {
  private static instance: Container;
  private sqliteDatabase: SQLiteDatabase | null = null;

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

  /**
   * Reset the container (for testing purposes)
   */
  reset(): void {
    if (this.sqliteDatabase) {
      this.sqliteDatabase.close();
      this.sqliteDatabase = null;
    }
  }
}

// Export singleton instance
export const container = Container.getInstance();

// Export convenience accessor for database
export const getDatabase = () => container.getDatabase();
