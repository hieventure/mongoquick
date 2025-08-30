import inquirer from 'inquirer';
import { Logger } from './logger';
import { initializeMongo, testConnection, createMongoConfigFromEnv } from '../index';

export class InteractiveWizard {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(true);
  }

  async start(): Promise<void> {
    console.clear();
    console.log('\n⚡ 🚀 Welcome to MongoQuick! 🚀');
    console.log('   Professional MongoDB setup made simple!\n');

    try {
      // Test connection
      console.log('🔍 First, let me check your MongoDB connection...\n');
      const health = await testConnection();

      if (!health.isConnected) {
        console.log('❌ Cannot connect to MongoDB');
        console.log('💡 Please make sure MongoDB is running:\n');
        console.log('   macOS: brew services start mongodb-community');
        console.log('   Linux: sudo systemctl start mongod');
        console.log('   Docker: docker run -d -p 27017:27017 mongo\n');
        return;
      }

      console.log('✅ Great! MongoDB is running and accessible');
      console.log(`   Latency: ${health.latency}ms\n`);

      // Ask for database name
      const { wantsSetup } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'wantsSetup',
          message: 'Would you like to create and initialize a MongoDB database?',
          default: true,
        },
      ]);

      if (!wantsSetup) {
        console.log('\n✨ Setup skipped. You can run mongoquick init --database <name> later.');
        return;
      }

      const { databaseName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'databaseName',
          message: 'What would you like to name your database?',
          default: 'my_awesome_app',
          validate: (input: string) => {
            if (!input.trim()) return 'Database name cannot be empty';
            if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(input.trim())) {
              return 'Database name must start with a letter and contain only letters, numbers, underscores, and hyphens';
            }
            return true;
          },
          filter: (input: string) => input.trim().toLowerCase(),
        },
      ]);

      // Show summary
      console.log('\n📋 Setup Summary:\n');
      console.log(`   Database name: ${databaseName}`);

      // Confirm
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Ready to create your MongoDB database?',
          default: true,
        },
      ]);

      if (!confirmed) {
        console.log('\n⏭️  Setup cancelled.');
        return;
      }

      // Setup
      console.log('\n🚀 Creating your MongoDB database...\n');
      const config = createMongoConfigFromEnv();
      config.database = databaseName;

      const initOptions: any = {
        config,
        createDatabase: true,
        verbose: true,
      };

      await initializeMongo(initOptions);

      // Success
      console.log('\n🎉 ✨ Magic complete! ✨');
      console.log(`Your MongoDB database "${databaseName}" is ready to use!\n`);
      console.log('🚀 Next steps:');
      console.log('   1. Connect your application to:');
      console.log(`      mongodb://localhost:27017/${databaseName}`);
      console.log('   2. Start building amazing things!');
      console.log('   3. Check database health anytime: mongoquick test\n');
    } catch (error) {
      this.logger.error('Wizard failed:', error);
      console.log('\n💔 Something went wrong. You can try the manual commands:');
      console.log('  mongoquick test    # Test connection');
      console.log('  mongoquick init    # Initialize database');
    }
  }
}
