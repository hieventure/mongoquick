import { MongoConfig } from '../types';

export const DEFAULT_MONGO_CONFIG: Partial<MongoConfig> = {
  options: {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true,
  },
};

export function createMongoConfigFromEnv(): MongoConfig {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const database = process.env.DATABASE_NAME || process.env.MONGO_DB || 'default_db';

  return {
    uri,
    database,
    ...DEFAULT_MONGO_CONFIG,
  };
}
