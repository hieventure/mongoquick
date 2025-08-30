/**
 * Smart Connection Manager - Expert MongoDB Connection Handling
 * Features: Connection pooling, health monitoring, auto-reconnection, circuit breaker
 */

import { MongoClient, MongoClientOptions } from 'mongodb';
import type { ConnectionProfile, ConnectionManager, ConnectionHealth } from '../types/profiles';

interface PooledConnection {
  client: MongoClient;
  profile: ConnectionProfile;
  lastUsed: Date;
  healthCache?: ConnectionHealth;
  healthCacheExpiry?: Date;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure?: Date;
  state: 'closed' | 'open' | 'half-open';
  nextAttempt?: Date;
}

export class SmartConnectionManager implements ConnectionManager {
  private readonly connections = new Map<string, PooledConnection>();
  private readonly circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly healthCacheTTL = 30000; // 30 seconds
  private readonly maxFailures = 3;
  private readonly circuitBreakerTimeout = 60000; // 1 minute
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Connect to MongoDB with intelligent connection reuse
   */
  async connect(profile: ConnectionProfile): Promise<void> {
    const existing = this.connections.get(profile.name);

    if (existing && (await this.isConnectionHealthy(existing))) {
      existing.lastUsed = new Date();
      return;
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(profile.name)) {
      throw new Error(
        `Connection to '${profile.name}' is temporarily disabled due to repeated failures`
      );
    }

    try {
      await this.createConnection(profile);
      this.resetCircuitBreaker(profile.name);
    } catch (error) {
      this.recordFailure(profile.name);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB with graceful cleanup
   */
  async disconnect(profileName?: string): Promise<void> {
    if (profileName) {
      const connection = this.connections.get(profileName);
      if (connection) {
        await this.closeConnection(connection);
        this.connections.delete(profileName);
      }
    } else {
      // Disconnect all
      await Promise.allSettled(
        Array.from(this.connections.values()).map(conn => this.closeConnection(conn))
      );
      this.connections.clear();
    }
  }

  /**
   * Test connection with comprehensive health check
   */
  async test(profile: ConnectionProfile): Promise<ConnectionHealth> {
    const startTime = Date.now();

    try {
      const client = new MongoClient(profile.uri, this.buildMongoOptions(profile));

      await client.connect();

      const admin = client.db().admin();
      const [serverStatus, buildInfo] = await Promise.all([
        admin.serverStatus(),
        admin.buildInfo(),
      ]);

      const latency = Date.now() - startTime;

      const health: ConnectionHealth = {
        isConnected: true,
        latency,
        serverVersion: buildInfo.version,
        replicaSet: serverStatus.repl?.setName,
        topology: this.determineTopology(serverStatus),
        connectionCount: serverStatus.connections?.current || 0,
        testedAt: new Date(),
      };

      await client.close();
      return health;
    } catch (error) {
      return {
        isConnected: false,
        latency: Date.now() - startTime,
        serverVersion: 'unknown',
        topology: 'Unknown',
        connectionCount: 0,
        testedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get cached health or perform fresh check
   */
  async getHealth(profileName: string): Promise<ConnectionHealth | null> {
    const connection = this.connections.get(profileName);
    if (!connection) {
      return null;
    }

    // Return cached health if still valid
    if (
      connection.healthCache &&
      connection.healthCacheExpiry &&
      new Date() < connection.healthCacheExpiry
    ) {
      return connection.healthCache;
    }

    // Perform fresh health check
    const health = await this.test(connection.profile);

    // Cache the result
    connection.healthCache = health;
    connection.healthCacheExpiry = new Date(Date.now() + this.healthCacheTTL);

    return health;
  }

  /**
   * List all active connections with their health
   */
  async listConnections(): Promise<Map<string, ConnectionHealth>> {
    const results = new Map<string, ConnectionHealth>();

    await Promise.allSettled(
      Array.from(this.connections.keys()).map(async name => {
        const health = await this.getHealth(name);
        if (health) {
          results.set(name, health);
        }
      })
    );

    return results;
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    await this.disconnect();
  }

  /**
   * Create new MongoDB connection with optimized settings
   */
  private async createConnection(profile: ConnectionProfile): Promise<void> {
    const client = new MongoClient(profile.uri, this.buildMongoOptions(profile));

    await client.connect();

    // Test the connection
    await client.db().admin().ping();

    const connection: PooledConnection = {
      client,
      profile,
      lastUsed: new Date(),
    };

    this.connections.set(profile.name, connection);
  }

  /**
   * Build MongoDB client options with expert defaults
   */
  private buildMongoOptions(profile: ConnectionProfile): MongoClientOptions {
    const defaults: MongoClientOptions = {
      // Connection Pool Settings
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,

      // Timeout Settings
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,

      // Reliability Settings
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary',

      // Compression (fallback gracefully if optional modules not available)
      compressors: ['zlib'],
    };

    // Merge with profile-specific options
    return {
      ...defaults,
      ...profile.options,
    };
  }

  /**
   * Check if connection is healthy
   */
  private async isConnectionHealthy(connection: PooledConnection): Promise<boolean> {
    try {
      await connection.client.db().admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close connection gracefully
   */
  private async closeConnection(connection: PooledConnection): Promise<void> {
    try {
      await connection.client.close();
    } catch (error) {
      // Log but don't throw on cleanup
      console.warn(`Error closing connection to ${connection.profile.name}:`, error);
    }
  }

  /**
   * Determine MongoDB topology from server status
   */
  private determineTopology(serverStatus: any): ConnectionHealth['topology'] {
    if (serverStatus.repl) {
      return serverStatus.repl.ismaster || serverStatus.repl.isPrimary
        ? 'ReplicaSetWithPrimary'
        : 'ReplicaSetNoPrimary';
    }

    if (serverStatus.sharding) {
      return 'Sharded';
    }

    return 'Single';
  }

  /**
   * Circuit breaker pattern implementation
   */
  private isCircuitBreakerOpen(profileName: string): boolean {
    const breaker = this.circuitBreakers.get(profileName);
    if (!breaker) return false;

    if (breaker.state === 'open') {
      if (breaker.nextAttempt && new Date() > breaker.nextAttempt) {
        breaker.state = 'half-open';
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Record connection failure for circuit breaker
   */
  private recordFailure(profileName: string): void {
    const breaker = this.circuitBreakers.get(profileName) || {
      failures: 0,
      state: 'closed' as const,
    };

    breaker.failures++;
    breaker.lastFailure = new Date();

    if (breaker.failures >= this.maxFailures) {
      breaker.state = 'open';
      breaker.nextAttempt = new Date(Date.now() + this.circuitBreakerTimeout);
    }

    this.circuitBreakers.set(profileName, breaker);
  }

  /**
   * Reset circuit breaker on successful connection
   */
  private resetCircuitBreaker(profileName: string): void {
    this.circuitBreakers.delete(profileName);
  }

  /**
   * Start periodic cleanup of idle connections
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(async () => {
      const now = new Date();
      const maxIdleTime = 300000; // 5 minutes

      for (const [name, connection] of this.connections) {
        const idleTime = now.getTime() - connection.lastUsed.getTime();

        if (idleTime > maxIdleTime) {
          await this.closeConnection(connection);
          this.connections.delete(name);
        }
      }
    }, 60000); // Run every minute
  }
}
