"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MONGO_CONFIG = void 0;
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
function createMongoConfigFromEnv() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const database = process.env.DATABASE_NAME || process.env.MONGO_DB || 'default_db';
    return {
        uri,
        database,
        ...exports.DEFAULT_MONGO_CONFIG,
    };
}
