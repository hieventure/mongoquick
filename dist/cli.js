#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wizard_1 = require("./utils/wizard");
const index_1 = require("./index");
const args = process.argv.slice(2);
const command = args[0];
async function main() {
    try {
        switch (command) {
            case 'test':
                console.log('🔍 Testing MongoDB connection...');
                const health = await (0, index_1.testConnection)();
                if (health.isConnected) {
                    console.log('✅ Connection successful!');
                    console.log(`   Latency: ${health.latency}ms`);
                    console.log(`   MongoDB version: ${health.serverInfo?.version || 'Unknown'}`);
                }
                else {
                    console.log('❌ Connection failed:', health.error);
                    process.exit(1);
                }
                break;
            case 'init':
                const dbIndex = args.indexOf('--database');
                const database = dbIndex !== -1 ? args[dbIndex + 1] : 'default_db';
                console.log(`🚀 Initializing database: ${database}`);
                const config = (0, index_1.createMongoConfigFromEnv)();
                config.database = database;
                await (0, index_1.initializeMongo)({
                    config,
                    createDatabase: true,
                    createIndexes: [
                        {
                            collection: 'users',
                            indexes: [
                                { keys: { email: 1 }, options: { unique: true, name: 'email_unique' } },
                                { keys: { createdAt: 1 }, options: { name: 'created_at_asc' } },
                            ],
                        },
                    ],
                    verbose: true,
                });
                break;
            case 'help':
            case '--help':
            case '-h':
                console.log('⚡ MongoQuick - Professional MongoDB toolkit');
                console.log('\nCommands:');
                console.log('  mongoquick          Start interactive setup (default)');
                console.log('  mongoquick test     Test MongoDB connection');
                console.log('  mongoquick init     Initialize database');
                console.log('  mongoquick help     Show this help');
                break;
            case 'version':
            case '--version':
            case '-v':
                const pkg = require('../package.json');
                console.log(pkg.version);
                break;
            default:
                // Default: start interactive wizard
                const wizard = new wizard_1.InteractiveWizard();
                await wizard.start();
                break;
        }
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
main();
