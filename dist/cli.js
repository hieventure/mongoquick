#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wizard_1 = require("./utils/wizard");
const index_1 = require("./index");
const profile_1 = require("./commands/profile");
const args = process.argv.slice(2);
const command = args[0];
const subCommand = args[1];
async function main() {
    try {
        switch (command) {
            case 'profile':
                await handleProfileCommands();
                break;
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
                    verbose: true,
                });
                break;
            case 'help':
            case '--help':
            case '-h':
                showHelp();
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
async function handleProfileCommands() {
    const profileCmd = new profile_1.ProfileCommands();
    switch (subCommand) {
        case 'add':
            const nameIndex = args.indexOf('--name') || args.indexOf('-n');
            const uriIndex = args.indexOf('--uri') || args.indexOf('-u');
            const dbIndex = args.indexOf('--database') || args.indexOf('-d');
            const envIndex = args.indexOf('--env') || args.indexOf('-e');
            if (nameIndex === -1 || uriIndex === -1) {
                console.error('❌ Required: --name and --uri');
                console.log('Usage: mongoquick profile add --name <name> --uri <uri> [--database <db>] [--env <env>]');
                process.exit(1);
            }
            await profileCmd.add({
                name: args[nameIndex + 1],
                uri: args[uriIndex + 1],
                database: dbIndex !== -1 ? args[dbIndex + 1] : undefined,
                environment: envIndex !== -1 ? args[envIndex + 1] : undefined,
                setDefault: args.includes('--default'),
            });
            break;
        case 'list':
        case 'ls':
            await profileCmd.list({
                verbose: args.includes('--verbose') || args.includes('-v'),
                json: args.includes('--json'),
            });
            break;
        case 'test':
            const profileName = args[2];
            await profileCmd.test(profileName, {
                verbose: args.includes('--verbose') || args.includes('-v'),
            });
            break;
        case 'use':
            const useProfileName = args[2];
            if (!useProfileName) {
                console.error('❌ Profile name required');
                console.log('Usage: mongoquick profile use <profile-name>');
                process.exit(1);
            }
            await profileCmd.use(useProfileName);
            break;
        case 'remove':
        case 'rm':
            const removeProfileName = args[2];
            if (!removeProfileName) {
                console.error('❌ Profile name required');
                console.log('Usage: mongoquick profile remove <profile-name> [--force]');
                process.exit(1);
            }
            await profileCmd.remove(removeProfileName, {
                force: args.includes('--force'),
            });
            break;
        case 'current':
            await profileCmd.current();
            break;
        case 'export':
            await profileCmd.export();
            break;
        default:
            console.error('❌ Unknown profile command:', subCommand);
            showProfileHelp();
            process.exit(1);
    }
}
function showHelp() {
    console.log('⚡ MongoQuick - Smart MongoDB Connection Management');
    console.log('\nCommands:');
    console.log('  mongoquick                    Start interactive setup (default)');
    console.log('  mongoquick test               Test current/default connection');
    console.log('  mongoquick init               Initialize database');
    console.log('');
    console.log('Profile Management:');
    console.log('  mongoquick profile add        Add new connection profile');
    console.log('  mongoquick profile list       List all profiles');
    console.log('  mongoquick profile use        Switch to profile');
    console.log('  mongoquick profile test       Test profile connections');
    console.log('  mongoquick profile current    Show current profile');
    console.log('  mongoquick profile remove     Remove profile');
    console.log('');
    console.log('Examples:');
    console.log('  mongoquick profile add --name local --uri mongodb://localhost:27017');
    console.log('  mongoquick profile add --name prod --uri mongodb+srv://cluster.mongodb.net --env production');
    console.log('  mongoquick profile use local');
    console.log('  mongoquick profile test');
}
function showProfileHelp() {
    console.log('\n📋 Profile Management Commands:');
    console.log('');
    console.log('  add     --name <name> --uri <uri> [options]    Add new profile');
    console.log('  list    [--verbose] [--json]                   List all profiles');
    console.log('  use     <profile-name>                         Switch to profile');
    console.log('  test    [profile-name] [--verbose]             Test connections');
    console.log('  current                                        Show current profile');
    console.log('  remove  <profile-name> [--force]               Remove profile');
    console.log('  export                                         Export profiles');
    console.log('');
    console.log('Add Options:');
    console.log('  --database, -d    Default database name');
    console.log('  --env, -e         Environment (local, dev, staging, prod)');
    console.log('  --default         Set as default profile');
}
main();
