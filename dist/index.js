"use strict";
// Environment variables loaded automatically by Node.js
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMongoConfigFromEnv = exports.DEFAULT_MONGO_CONFIG = exports.MongoInitializer = exports.MongoConnection = void 0;
exports.initializeMongo = initializeMongo;
exports.testConnection = testConnection;
exports.quickSetup = quickSetup;
// Export all types
__exportStar(require("./types"), exports);
// Export utilities
var connection_1 = require("./utils/connection");
Object.defineProperty(exports, "MongoConnection", { enumerable: true, get: function () { return connection_1.MongoConnection; } });
var initializer_1 = require("./utils/initializer");
Object.defineProperty(exports, "MongoInitializer", { enumerable: true, get: function () { return initializer_1.MongoInitializer; } });
// Export config
var defaults_1 = require("./config/defaults");
Object.defineProperty(exports, "DEFAULT_MONGO_CONFIG", { enumerable: true, get: function () { return defaults_1.DEFAULT_MONGO_CONFIG; } });
Object.defineProperty(exports, "createMongoConfigFromEnv", { enumerable: true, get: function () { return defaults_1.createMongoConfigFromEnv; } });
// Main initialization function
async function initializeMongo(options = {}) {
    const { createMongoConfigFromEnv } = await Promise.resolve().then(() => __importStar(require('./config/defaults')));
    const { MongoInitializer } = await Promise.resolve().then(() => __importStar(require('./utils/initializer')));
    const config = options.config || createMongoConfigFromEnv();
    const defaultOptions = {
        config,
        createDatabase: true,
        verbose: true,
        ...options,
    };
    const initializer = new MongoInitializer(defaultOptions);
    await initializer.initialize();
}
// Quick connection test
async function testConnection(config) {
    const { createMongoConfigFromEnv } = await Promise.resolve().then(() => __importStar(require('./config/defaults')));
    const { MongoConnection } = await Promise.resolve().then(() => __importStar(require('./utils/connection')));
    const mongoConfig = config || createMongoConfigFromEnv();
    const connection = new MongoConnection(mongoConfig);
    try {
        await connection.connect();
        const health = await connection.healthCheck();
        await connection.disconnect();
        return health;
    }
    catch (error) {
        return {
            isConnected: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
// CLI helper for quick setup
async function quickSetup(databaseName) {
    const { createMongoConfigFromEnv } = await Promise.resolve().then(() => __importStar(require('./config/defaults')));
    const config = createMongoConfigFromEnv();
    if (databaseName) {
        config.database = databaseName;
    }
    await initializeMongo({
        config,
        createDatabase: true,
        verbose: true,
    });
}
