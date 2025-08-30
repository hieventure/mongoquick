export * from './types';
export { MongoConnection } from './utils/connection';
export { MongoInitializer } from './utils/initializer';
export { DEFAULT_MONGO_CONFIG, COMMON_INDEXES, createMongoConfigFromEnv } from './config/defaults';
export declare function initializeMongo(options?: Partial<import('./types').InitOptions>): Promise<void>;
export declare function testConnection(config?: import('./types').MongoConfig): Promise<import("./types").HealthCheckResult>;
export declare function quickSetup(databaseName?: string): Promise<void>;
