import { MongoConnection } from './connection';
import { Logger } from './logger';
import { InitOptions, DatabaseUser } from '../types';

export class MongoInitializer {
  private connection: MongoConnection;
  private logger: Logger;

  constructor(private options: InitOptions) {
    this.connection = new MongoConnection(options.config, options.verbose);
    this.logger = new Logger(options.verbose);
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('🚀 Starting MongoDB initialization...');

      // Step 1: Connect to MongoDB
      this.logger.step(1, 4, 'Connecting to MongoDB...');
      await this.connection.connect();

      // Step 2: Health check
      this.logger.step(2, 4, 'Performing health check...');
      await this.performHealthCheck();

      // Step 3: Create database if needed
      if (this.options.createDatabase) {
        this.logger.step(3, 4, 'Ensuring database exists...');
        await this.ensureDatabaseExists();
      }

      // Step 4: Create users if specified
      if (this.options.createUsers && this.options.createUsers.length > 0) {
        this.logger.step(4, 4, 'Creating database users...');
        await this.createUsers();
      }

      // Note: Index creation and data seeding removed for simplified scope

      this.logger.success('🎉 MongoDB initialization completed successfully!');
    } catch (error) {
      this.logger.error('MongoDB initialization failed:', error);
      throw error;
    } finally {
      await this.connection.disconnect();
    }
  }

  private async performHealthCheck(): Promise<void> {
    const healthResult = await this.connection.healthCheck();

    if (!healthResult.isConnected) {
      throw new Error(`Health check failed: ${healthResult.error}`);
    }

    this.logger.success(`Health check passed (latency: ${healthResult.latency}ms)`);

    if (healthResult.serverInfo) {
      this.logger.info(`MongoDB version: ${healthResult.serverInfo.version}`);
      this.logger.info(`Platform: ${healthResult.serverInfo.platform}`);
      this.logger.info(`Storage engine: ${healthResult.serverInfo.storageEngine}`);
    }
  }

  private async ensureDatabaseExists(): Promise<void> {
    const db = this.connection.getDb();

    // Create a dummy collection to ensure database exists
    // This will be automatically created when we insert the first document
    const collections = await this.connection.listCollections();

    if (collections.length === 0) {
      // Create a dummy collection to initialize the database
      await db.createCollection('_init');
      await db.collection('_init').insertOne({
        initialized: true,
        timestamp: new Date(),
      });
      this.logger.success(`Database '${this.options.config.database}' created`);
    } else {
      this.logger.info(`Database '${this.options.config.database}' already exists`);
    }
  }

  private async createUsers(): Promise<void> {
    if (!this.options.createUsers) return;

    const db = this.connection.getDb();

    for (const user of this.options.createUsers) {
      try {
        await db.admin().command({
          createUser: user.username,
          pwd: user.password,
          roles: user.roles,
        });
        this.logger.success(`Created user: ${user.username}`);
      } catch (error: any) {
        if (error.code === 51003) {
          // User already exists
          this.logger.warn(`User ${user.username} already exists`);
        } else {
          this.logger.error(`Failed to create user ${user.username}:`, error.message);
          throw error;
        }
      }
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.connection.connect();
      const healthResult = await this.connection.healthCheck();
      await this.connection.disconnect();
      return healthResult.isConnected;
    } catch {
      return false;
    }
  }
}
