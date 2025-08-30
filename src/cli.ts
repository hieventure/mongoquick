#!/usr/bin/env node

import { InteractiveWizard } from './utils/wizard';
import { testConnection, initializeMongo, createMongoConfigFromEnv } from './index';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'test':
        console.log('🔍 Testing MongoDB connection...');
        const health = await testConnection();
        if (health.isConnected) {
          console.log('✅ Connection successful!');
          console.log(`   Latency: ${health.latency}ms`);
          console.log(`   MongoDB version: ${health.serverInfo?.version || 'Unknown'}`);
        } else {
          console.log('❌ Connection failed:', health.error);
          process.exit(1);
        }
        break;

      case 'init':
        const dbIndex = args.indexOf('--database');
        const database = dbIndex !== -1 ? args[dbIndex + 1] : 'default_db';

        console.log(`🚀 Initializing database: ${database}`);
        const config = createMongoConfigFromEnv();
        config.database = database;

        await initializeMongo({
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
        const wizard = new InteractiveWizard();
        await wizard.start();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
