"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoInitializer = void 0;
const connection_1 = require("./connection");
const logger_1 = require("./logger");
class MongoInitializer {
    constructor(options) {
        this.options = options;
        this.connection = new connection_1.MongoConnection(options.config, options.verbose);
        this.logger = new logger_1.Logger(options.verbose);
    }
    async initialize() {
        try {
            this.logger.info('🚀 Starting MongoDB initialization...');
            // Step 1: Connect to MongoDB
            this.logger.step(1, 6, 'Connecting to MongoDB...');
            await this.connection.connect();
            // Step 2: Health check
            this.logger.step(2, 6, 'Performing health check...');
            await this.performHealthCheck();
            // Step 3: Create database if needed
            if (this.options.createDatabase) {
                this.logger.step(3, 6, 'Ensuring database exists...');
                await this.ensureDatabaseExists();
            }
            // Step 4: Create users if specified
            if (this.options.createUsers && this.options.createUsers.length > 0) {
                this.logger.step(4, 6, 'Creating database users...');
                await this.createUsers();
            }
            // Step 5: Create indexes if specified
            if (this.options.createIndexes && this.options.createIndexes.length > 0) {
                this.logger.step(5, 6, 'Creating indexes...');
                await this.createIndexes();
            }
            // Step 6: Seed data if specified
            if (this.options.seedData && this.options.seedData.length > 0) {
                this.logger.step(6, 6, 'Seeding initial data...');
                await this.seedData();
            }
            this.logger.success('🎉 MongoDB initialization completed successfully!');
        }
        catch (error) {
            this.logger.error('MongoDB initialization failed:', error);
            throw error;
        }
        finally {
            await this.connection.disconnect();
        }
    }
    async performHealthCheck() {
        const healthResult = await this.connection.healthCheck();
        if (!healthResult.isConnected) {
            throw new Error(`Health check failed: ${healthResult.error}`);
        }
        this.logger.success(`Health check passed (latency: ${healthResult.latency}ms)`);
        if (healthResult.serverInfo) {
            this.logger.info(`MongoDB version: ${healthResult.serverInfo.version}`);
            this.logger.info(`Platform: ${healthResult.serverInfo.platform}`);
            this.logger.info(`Storage engine: ${healthResult.serverInfo.storageEngine}`);
        }
    }
    async ensureDatabaseExists() {
        const db = this.connection.getDb();
        // Create a dummy collection to ensure database exists
        // This will be automatically created when we insert the first document
        const collections = await this.connection.listCollections();
        if (collections.length === 0) {
            // Create a dummy collection to initialize the database
            await db.createCollection('_init');
            await db.collection('_init').insertOne({
                initialized: true,
                timestamp: new Date()
            });
            this.logger.success(`Database '${this.options.config.database}' created`);
        }
        else {
            this.logger.info(`Database '${this.options.config.database}' already exists`);
        }
    }
    async createUsers() {
        if (!this.options.createUsers)
            return;
        const db = this.connection.getDb();
        for (const user of this.options.createUsers) {
            try {
                await db.admin().command({
                    createUser: user.username,
                    pwd: user.password,
                    roles: user.roles,
                });
                this.logger.success(`Created user: ${user.username}`);
            }
            catch (error) {
                if (error.code === 51003) { // User already exists
                    this.logger.warn(`User ${user.username} already exists`);
                }
                else {
                    this.logger.error(`Failed to create user ${user.username}:`, error.message);
                    throw error;
                }
            }
        }
    }
    async createIndexes() {
        if (!this.options.createIndexes)
            return;
        const db = this.connection.getDb();
        for (const collectionIndex of this.options.createIndexes) {
            const collection = db.collection(collectionIndex.collection);
            for (const index of collectionIndex.indexes) {
                try {
                    const indexName = await collection.createIndex(index.keys, index.options);
                    this.logger.success(`Created index '${indexName}' on collection '${collectionIndex.collection}'`);
                }
                catch (error) {
                    if (error.code === 85) { // Index already exists
                        this.logger.warn(`Index already exists on collection '${collectionIndex.collection}'`);
                    }
                    else {
                        this.logger.error(`Failed to create index on collection '${collectionIndex.collection}':`, error.message);
                        throw error;
                    }
                }
            }
        }
    }
    async seedData() {
        if (!this.options.seedData)
            return;
        const db = this.connection.getDb();
        for (const seedCollection of this.options.seedData) {
            const collection = db.collection(seedCollection.collection);
            // Check if collection already has data
            const existingCount = await collection.countDocuments();
            if (existingCount > 0) {
                this.logger.warn(`Collection '${seedCollection.collection}' already has ${existingCount} documents, skipping seed`);
                continue;
            }
            if (seedCollection.data.length > 0) {
                await collection.insertMany(seedCollection.data);
                this.logger.success(`Seeded ${seedCollection.data.length} documents to '${seedCollection.collection}'`);
            }
        }
    }
    async checkConnection() {
        try {
            await this.connection.connect();
            const healthResult = await this.connection.healthCheck();
            await this.connection.disconnect();
            return healthResult.isConnected;
        }
        catch {
            return false;
        }
    }
}
exports.MongoInitializer = MongoInitializer;
