import { MongoClient, Db } from 'mongodb';
import { MongoConfig, HealthCheckResult } from '../types';
import { Logger } from './logger';

export class MongoConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private logger: Logger;

  constructor(private config: MongoConfig, verbose: boolean = true) {
    this.logger = new Logger(verbose);
  }

  async connect(): Promise<{ client: MongoClient; db: Db }> {
    try {
      this.logger.info('Connecting to MongoDB...');

      this.client = new MongoClient(this.config.uri, {
        maxPoolSize: this.config.options?.maxPoolSize || 50,
        serverSelectionTimeoutMS: this.config.options?.serverSelectionTimeoutMS || 5000,
        socketTimeoutMS: this.config.options?.socketTimeoutMS || 45000,
        connectTimeoutMS: this.config.options?.connectTimeoutMS || 10000,
        maxIdleTimeMS: this.config.options?.maxIdleTimeMS || 30000,
        retryWrites: this.config.options?.retryWrites ?? true,
        retryReads: this.config.options?.retryReads ?? true,
      });

      await this.client.connect();
      this.db = this.client.db(this.config.database);

      this.logger.success(`Connected to MongoDB database: ${this.config.database}`);
      return { client: this.client, db: this.db };
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.logger.info('Disconnected from MongoDB');
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      if (!this.client || !this.db) {
        return { isConnected: false, error: 'Not connected' };
      }

      const startTime = Date.now();

      // Ping the database
      await this.db.admin().ping();
      const latency = Date.now() - startTime;

      // Get server info
      const serverStatus = await this.db.admin().serverStatus();

      return {
        isConnected: true,
        latency,
        serverInfo: {
          version: serverStatus.version,
          platform: serverStatus.os?.name || 'unknown',
          storageEngine: serverStatus.storageEngine?.name || 'unknown',
        },
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async listDatabases(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected to MongoDB');
    }

    const result = await this.client.db().admin().listDatabases();
    return result.databases.map(db => db.name);
  }

  async listCollections(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Not connected to database');
    }

    const collections = await this.db.listCollections().toArray();
    return collections.map(col => col.name);
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Not connected to MongoDB');
    }
    return this.client;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Not connected to database');
    }
    return this.db;
  }
}
