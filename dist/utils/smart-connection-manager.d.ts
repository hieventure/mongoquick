/**
 * Smart Connection Manager - Expert MongoDB Connection Handling
 * Features: Connection pooling, health monitoring, auto-reconnection, circuit breaker
 */
import type { ConnectionProfile, ConnectionManager, ConnectionHealth } from '../types/profiles';
export declare class SmartConnectionManager implements ConnectionManager {
    private readonly connections;
    private readonly circuitBreakers;
    private readonly healthCacheTTL;
    private readonly maxFailures;
    private readonly circuitBreakerTimeout;
    private cleanupInterval?;
    constructor();
    /**
     * Connect to MongoDB with intelligent connection reuse
     */
    connect(profile: ConnectionProfile): Promise<void>;
    /**
     * Disconnect from MongoDB with graceful cleanup
     */
    disconnect(profileName?: string): Promise<void>;
    /**
     * Test connection with comprehensive health check
     */
    test(profile: ConnectionProfile): Promise<ConnectionHealth>;
    /**
     * Get cached health or perform fresh check
     */
    getHealth(profileName: string): Promise<ConnectionHealth | null>;
    /**
     * List all active connections with their health
     */
    listConnections(): Promise<Map<string, ConnectionHealth>>;
    /**
     * Cleanup all resources
     */
    cleanup(): Promise<void>;
    /**
     * Create new MongoDB connection with optimized settings
     */
    private createConnection;
    /**
     * Build MongoDB client options with expert defaults
     */
    private buildMongoOptions;
    /**
     * Check if connection is healthy
     */
    private isConnectionHealthy;
    /**
     * Close connection gracefully
     */
    private closeConnection;
    /**
     * Determine MongoDB topology from server status
     */
    private determineTopology;
    /**
     * Circuit breaker pattern implementation
     */
    private isCircuitBreakerOpen;
    /**
     * Record connection failure for circuit breaker
     */
    private recordFailure;
    /**
     * Reset circuit breaker on successful connection
     */
    private resetCircuitBreaker;
    /**
     * Start periodic cleanup of idle connections
     */
    private startCleanupTimer;
}
