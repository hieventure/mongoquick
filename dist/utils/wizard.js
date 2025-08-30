"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveWizard = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const logger_1 = require("./logger");
const index_1 = require("../index");
class InteractiveWizard {
    constructor() {
        this.logger = new logger_1.Logger(true);
    }
    async start() {
        console.clear();
        console.log('\n⚡ 🚀 Welcome to MongoKit! 🚀');
        console.log("   Professional MongoDB setup made simple!\n");
        try {
            // Test connection
            console.log('🔍 First, let me check your MongoDB connection...\n');
            const health = await (0, index_1.testConnection)();
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
            const { wantsSetup } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'wantsSetup',
                    message: 'Would you like to create and initialize a MongoDB database?',
                    default: true,
                },
            ]);
            if (!wantsSetup) {
                console.log('\n✨ Setup skipped. You can run mongokit init --database <name> later.');
                return;
            }
            const { databaseName } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'databaseName',
                    message: 'What would you like to name your database?',
                    default: 'my_awesome_app',
                    validate: (input) => {
                        if (!input.trim())
                            return 'Database name cannot be empty';
                        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(input.trim())) {
                            return 'Database name must start with a letter and contain only letters, numbers, underscores, and hyphens';
                        }
                        return true;
                    },
                    filter: (input) => input.trim().toLowerCase(),
                },
            ]);
            // Ask for features
            const { createIndexes } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'createIndexes',
                    message: 'Create optimized indexes? (Recommended for better performance)',
                    default: true,
                },
            ]);
            // Show summary
            console.log('\n📋 Setup Summary:\n');
            console.log(`   Database name: ${databaseName}`);
            console.log(`   Optimized indexes: ${createIndexes ? '✅ Yes' : '❌ No'}`);
            if (createIndexes) {
                console.log('\n   📊 Indexes will be created for common collections');
            }
            // Confirm
            const { confirmed } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirmed',
                    message: 'Ready to create your optimized MongoDB setup?',
                    default: true,
                },
            ]);
            if (!confirmed) {
                console.log('\n⏭️  Setup cancelled.');
                return;
            }
            // Setup
            console.log('\n🚀 Creating your optimized MongoDB setup...\n');
            const config = (0, index_1.createMongoConfigFromEnv)();
            config.database = databaseName;
            const initOptions = {
                config,
                createDatabase: true,
                verbose: true,
            };
            if (createIndexes) {
                const { COMMON_INDEXES } = await Promise.resolve().then(() => __importStar(require('../config/defaults')));
                initOptions.createIndexes = [
                    { collection: 'users', indexes: COMMON_INDEXES.users },
                    { collection: 'sessions', indexes: COMMON_INDEXES.sessions },
                    { collection: 'events', indexes: COMMON_INDEXES.events },
                    { collection: 'teams', indexes: COMMON_INDEXES.teams },
                    { collection: 'votes', indexes: COMMON_INDEXES.votes },
                ];
            }
            await (0, index_1.initializeMongo)(initOptions);
            // Success
            console.log('\n🎉 ✨ Magic complete! ✨');
            console.log(`Your MongoDB database "${databaseName}" is ready to use!\n`);
            console.log('🚀 Next steps:');
            console.log('   1. Connect your application to:');
            console.log(`      mongodb://localhost:27017/${databaseName}`);
            console.log('   2. Start building amazing things!');
            console.log('   3. Check database health anytime: mongokit test\n');
        }
        catch (error) {
            this.logger.error('Wizard failed:', error);
            console.log('\n💔 Something went wrong. You can try the manual commands:');
            console.log('  mongokit test    # Test connection');
            console.log('  mongokit init    # Initialize database');
        }
    }
}
exports.InteractiveWizard = InteractiveWizard;
