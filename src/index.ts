// Environment variables loaded automatically by Node.js

// Export all types
export * from './types';

// Export utilities
export { MongoConnection } from './utils/connection';
export { MongoInitializer } from './utils/initializer';

// Export config
export { DEFAULT_MONGO_CONFIG, COMMON_INDEXES, createMongoConfigFromEnv } from './config/defaults';

// Main initialization function
export async function initializeMongo(options: Partial<import('./types').InitOptions> = {}) {
  const { createMongoConfigFromEnv } = await import('./config/defaults');
  const { MongoInitializer } = await import('./utils/initializer');

  const config = options.config || createMongoConfigFromEnv();

  const defaultOptions: import('./types').InitOptions = {
    config,
    createDatabase: true,
    verbose: true,
    ...options,
  };

  const initializer = new MongoInitializer(defaultOptions);
  await initializer.initialize();
}

// Quick connection test
export async function testConnection(config?: import('./types').MongoConfig) {
  const { createMongoConfigFromEnv } = await import('./config/defaults');
  const { MongoConnection } = await import('./utils/connection');

  const mongoConfig = config || createMongoConfigFromEnv();
  const connection = new MongoConnection(mongoConfig);

  try {
    await connection.connect();
    const health = await connection.healthCheck();
    await connection.disconnect();
    return health;
  } catch (error) {
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// CLI helper for quick setup
export async function quickSetup(databaseName?: string) {
  const { createMongoConfigFromEnv, COMMON_INDEXES } = await import('./config/defaults');

  const config = createMongoConfigFromEnv();
  if (databaseName) {
    config.database = databaseName;
  }

  await initializeMongo({
    config,
    createDatabase: true,
    createIndexes: [
      { collection: 'users', indexes: COMMON_INDEXES.users },
      { collection: 'sessions', indexes: COMMON_INDEXES.sessions },
      { collection: 'events', indexes: COMMON_INDEXES.events },
      { collection: 'teams', indexes: COMMON_INDEXES.teams },
      { collection: 'votes', indexes: COMMON_INDEXES.votes },
    ],
    verbose: true,
  });
}
