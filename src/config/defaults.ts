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

export const COMMON_INDEXES = {
  users: [
    {
      keys: { email: 1 as const },
      options: { unique: true, name: 'email_unique' },
    },
    {
      keys: { createdAt: 1 as const },
      options: { name: 'created_at_asc' },
    },
  ],
  sessions: [
    {
      keys: { sessionToken: 1 as const },
      options: { unique: true, name: 'session_token_unique' },
    },
    {
      keys: { expiresAt: 1 as const },
      options: {
        expireAfterSeconds: 0,
        name: 'session_expiry',
      },
    },
  ],
  events: [
    {
      keys: { status: 1 as const, startDate: 1 as const },
      options: { name: 'status_start_date' },
    },
  ],
  teams: [
    {
      keys: { eventId: 1 as const, teamCode: 1 as const },
      options: { unique: true, name: 'event_team_code_unique' },
    },
  ],
  votes: [
    {
      keys: { userId: 1 as const, teamId: 1 as const },
      options: { unique: true, name: 'user_team_vote_unique' },
    },
  ],
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
