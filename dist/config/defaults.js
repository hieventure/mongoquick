"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMON_INDEXES = exports.DEFAULT_MONGO_CONFIG = void 0;
exports.createMongoConfigFromEnv = createMongoConfigFromEnv;
exports.DEFAULT_MONGO_CONFIG = {
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
exports.COMMON_INDEXES = {
    users: [
        {
            keys: { email: 1 },
            options: { unique: true, name: 'email_unique' },
        },
        {
            keys: { createdAt: 1 },
            options: { name: 'created_at_asc' },
        },
    ],
    sessions: [
        {
            keys: { sessionToken: 1 },
            options: { unique: true, name: 'session_token_unique' },
        },
        {
            keys: { expiresAt: 1 },
            options: {
                expireAfterSeconds: 0,
                name: 'session_expiry',
            },
        },
    ],
    events: [
        {
            keys: { status: 1, startDate: 1 },
            options: { name: 'status_start_date' },
        },
    ],
    teams: [
        {
            keys: { eventId: 1, teamCode: 1 },
            options: { unique: true, name: 'event_team_code_unique' },
        },
    ],
    votes: [
        {
            keys: { userId: 1, teamId: 1 },
            options: { unique: true, name: 'user_team_vote_unique' },
        },
    ],
};
function createMongoConfigFromEnv() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const database = process.env.DATABASE_NAME || process.env.MONGO_DB || 'default_db';
    return {
        uri,
        database,
        ...exports.DEFAULT_MONGO_CONFIG,
    };
}
