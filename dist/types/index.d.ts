/**
 * Core types for MongoDB operations and Smart Connection Management
 */
export * from './profiles';
export interface MongoConfig {
    uri: string;
    database: string;
    options?: {
        maxPoolSize?: number;
        serverSelectionTimeoutMS?: number;
        socketTimeoutMS?: number;
        connectTimeoutMS?: number;
        maxIdleTimeMS?: number;
        retryWrites?: boolean;
        retryReads?: boolean;
    };
}
export interface DatabaseUser {
    username: string;
    password: string;
    roles: Array<{
        role: string;
        db: string;
    }>;
}
export interface InitOptions {
    config: MongoConfig;
    createDatabase?: boolean;
    createUsers?: DatabaseUser[];
    verbose?: boolean;
}
export interface HealthCheckResult {
    isConnected: boolean;
    latency?: number;
    serverInfo?: {
        version: string;
        platform: string;
        storageEngine: string;
    };
    error?: string;
}
export interface MigrationScript {
    version: string;
    description: string;
    up: (db: any) => Promise<void>;
    down?: (db: any) => Promise<void>;
}
