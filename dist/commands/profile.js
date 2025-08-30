"use strict";
/**
 * Profile Management CLI Commands - Expert DX Design
 * Features: Smart auto-completion, rich output, error handling, progressive disclosure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileCommands = void 0;
const profile_store_1 = require("../utils/profile-store");
const smart_connection_manager_1 = require("../utils/smart-connection-manager");
class ProfileCommands {
    constructor() {
        this.store = new profile_store_1.SecureProfileStore();
        this.manager = new smart_connection_manager_1.SmartConnectionManager();
    }
    /**
     * Add new connection profile with smart validation
     */
    async add(options) {
        try {
            // Smart URI validation and enhancement
            const enhancedUri = this.enhanceUri(options.uri);
            const profile = {
                name: options.name,
                uri: enhancedUri,
                database: options.database,
                alias: options.alias,
                metadata: {
                    createdAt: new Date(),
                    environment: options.environment || this.detectEnvironment(options.name, enhancedUri),
                    isDefault: options.setDefault || false,
                },
            };
            // Test connection before saving
            console.log(`🔍 Testing connection to '${options.name}'...`);
            const health = await this.manager.test(profile);
            if (!health.isConnected) {
                throw new Error(`Connection test failed: ${health.error}`);
            }
            await this.store.add(profile);
            if (options.setDefault) {
                await this.store.setDefault(options.name);
            }
            console.log('✅ Profile added successfully!');
            console.log(`   Name: ${options.name}`);
            console.log(`   Environment: ${profile.metadata?.environment}`);
            console.log(`   Server: MongoDB ${health.serverVersion}`);
            console.log(`   Latency: ${health.latency}ms`);
            if (options.setDefault) {
                console.log(`   🌟 Set as default profile`);
            }
        }
        catch (error) {
            console.error('❌ Failed to add profile:', error instanceof Error ? error.message : error);
            // Provide helpful suggestions
            if (error instanceof Error && error.message.includes('ENOTFOUND')) {
                console.log('\n💡 Suggestions:');
                console.log('   • Check if MongoDB server is running');
                console.log('   • Verify the hostname/IP address');
                console.log('   • Ensure network connectivity');
            }
            process.exit(1);
        }
    }
    /**
     * List profiles with rich formatting
     */
    async list(options = {}) {
        try {
            const profiles = await this.store.list();
            if (profiles.length === 0) {
                console.log('📭 No connection profiles found.');
                console.log('\n💡 Add your first profile:');
                console.log('   mongoquick profile add local mongodb://localhost:27017');
                return;
            }
            if (options.json) {
                console.log(JSON.stringify(profiles, null, 2));
                return;
            }
            await this.displayProfilesTable(profiles, options);
        }
        catch (error) {
            console.error('❌ Failed to list profiles:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Test single or all profiles
     */
    async test(profileName, options = {}) {
        try {
            if (profileName) {
                await this.testSingleProfile(profileName, options);
            }
            else {
                await this.testAllProfiles(options);
            }
        }
        catch (error) {
            console.error('❌ Test failed:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Use/switch to profile
     */
    async use(profileName) {
        try {
            const profile = await this.store.get(profileName);
            if (!profile) {
                console.error(`❌ Profile '${profileName}' not found.`);
                await this.suggestSimilarProfiles(profileName);
                process.exit(1);
            }
            console.log(`🔄 Switching to profile '${profileName}'...`);
            // Test connection
            const health = await this.manager.test(profile);
            if (!health.isConnected) {
                console.error(`❌ Cannot switch to '${profileName}': ${health.error}`);
                process.exit(1);
            }
            // Set as default
            await this.store.setDefault(profileName);
            console.log('✅ Successfully switched to profile:');
            console.log(`   Name: ${profileName}`);
            console.log(`   Environment: ${profile.metadata?.environment || 'unknown'}`);
            console.log(`   Server: MongoDB ${health.serverVersion}`);
            console.log(`   Latency: ${health.latency}ms`);
        }
        catch (error) {
            console.error('❌ Failed to switch profile:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Remove profile with confirmation
     */
    async remove(profileName, options = {}) {
        try {
            const profile = await this.store.get(profileName);
            if (!profile) {
                console.error(`❌ Profile '${profileName}' not found.`);
                process.exit(1);
            }
            if (!options.force) {
                // Ask for confirmation (simplified for now)
                console.log(`⚠️  About to remove profile '${profileName}'`);
                console.log(`   Environment: ${profile.metadata?.environment || 'unknown'}`);
                console.log(`   URI: ${this.maskUri(profile.uri)}`);
                // In real implementation, use inquirer for confirmation
                console.log('\nUse --force to skip confirmation');
                return;
            }
            const removed = await this.store.remove(profileName);
            if (removed) {
                console.log(`✅ Profile '${profileName}' removed successfully.`);
            }
            else {
                console.error(`❌ Failed to remove profile '${profileName}'.`);
                process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ Failed to remove profile:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Show current/default profile
     */
    async current() {
        try {
            const defaultProfile = await this.store.getDefault();
            if (!defaultProfile) {
                console.log('📭 No default profile set.');
                console.log('\n💡 Set a default profile:');
                console.log('   mongoquick profile use <profile-name>');
                return;
            }
            console.log('🌟 Current profile:');
            console.log(`   Name: ${defaultProfile.name}`);
            console.log(`   Environment: ${defaultProfile.metadata?.environment || 'unknown'}`);
            console.log(`   URI: ${this.maskUri(defaultProfile.uri)}`);
            if (defaultProfile.database) {
                console.log(`   Database: ${defaultProfile.database}`);
            }
        }
        catch (error) {
            console.error('❌ Failed to get current profile:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Export profiles
     */
    async export() {
        try {
            const data = await this.store.export();
            console.log(data);
        }
        catch (error) {
            console.error('❌ Failed to export profiles:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Smart URI enhancement
     */
    enhanceUri(uri) {
        // Add protocol if missing
        if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
            if (uri.includes('.mongodb.net') || uri.includes('.mongo.ondigitalocean.com')) {
                return `mongodb+srv://${uri}`;
            }
            else {
                return `mongodb://${uri}`;
            }
        }
        return uri;
    }
    /**
     * Auto-detect environment from name and URI
     */
    detectEnvironment(name, uri) {
        const lowerName = name.toLowerCase();
        const lowerUri = uri.toLowerCase();
        if (lowerName.includes('prod') ||
            lowerName.includes('production') ||
            lowerUri.includes('prod') ||
            lowerUri.includes('production')) {
            return 'production';
        }
        if (lowerName.includes('staging') ||
            lowerName.includes('stage') ||
            lowerUri.includes('staging') ||
            lowerUri.includes('stage')) {
            return 'staging';
        }
        if (lowerName.includes('dev') ||
            lowerName.includes('development') ||
            lowerUri.includes('dev') ||
            lowerUri.includes('development')) {
            return 'development';
        }
        if (lowerUri.includes('localhost') || lowerUri.includes('127.0.0.1')) {
            return 'local';
        }
        return 'unknown';
    }
    /**
     * Display profiles in beautiful table format
     */
    async displayProfilesTable(profiles, options) {
        console.log(`\n📋 Connection Profiles (${profiles.length})\n`);
        for (const profile of profiles) {
            const isDefault = profile.metadata?.isDefault ? '🌟 ' : '   ';
            const env = this.formatEnvironment(profile.metadata?.environment);
            console.log(`${isDefault}${profile.name}`);
            console.log(`      Environment: ${env}`);
            console.log(`      URI: ${this.maskUri(profile.uri)}`);
            if (profile.database) {
                console.log(`      Database: ${profile.database}`);
            }
            if (options.verbose) {
                console.log(`      Created: ${profile.metadata?.createdAt?.toLocaleDateString()}`);
                if (profile.metadata?.lastUsed) {
                    console.log(`      Last Used: ${profile.metadata.lastUsed.toLocaleDateString()}`);
                }
            }
            console.log();
        }
    }
    /**
     * Test single profile with detailed output
     */
    async testSingleProfile(profileName, options) {
        const profile = await this.store.get(profileName);
        if (!profile) {
            console.error(`❌ Profile '${profileName}' not found.`);
            await this.suggestSimilarProfiles(profileName);
            return;
        }
        console.log(`🔍 Testing connection to '${profileName}'...`);
        const health = await this.manager.test(profile);
        if (health.isConnected) {
            console.log('✅ Connection successful!');
            console.log(`   Server: MongoDB ${health.serverVersion}`);
            console.log(`   Latency: ${health.latency}ms`);
            console.log(`   Topology: ${health.topology}`);
            if (health.replicaSet) {
                console.log(`   Replica Set: ${health.replicaSet}`);
            }
            console.log(`   Active Connections: ${health.connectionCount}`);
        }
        else {
            console.error('❌ Connection failed!');
            console.error(`   Error: ${health.error}`);
            console.error(`   Latency: ${health.latency}ms`);
        }
    }
    /**
     * Test all profiles concurrently
     */
    async testAllProfiles(options) {
        const profiles = await this.store.list();
        if (profiles.length === 0) {
            console.log('📭 No profiles to test.');
            return;
        }
        console.log(`🔍 Testing ${profiles.length} connection profiles...\n`);
        const tests = profiles.map(async (profile) => {
            const health = await this.manager.test(profile);
            return { profile, health };
        });
        const results = await Promise.allSettled(tests);
        for (const result of results) {
            if (result.status === 'fulfilled') {
                const { profile, health } = result.value;
                const status = health.isConnected ? '✅' : '❌';
                const latency = health.isConnected ? `${health.latency}ms` : 'failed';
                console.log(`${status} ${profile.name} (${latency})`);
                if (!health.isConnected && options.verbose) {
                    console.log(`      Error: ${health.error}`);
                }
            }
        }
    }
    /**
     * Suggest similar profile names for typos
     */
    async suggestSimilarProfiles(input) {
        const profiles = await this.store.list();
        if (profiles.length === 0)
            return;
        const similar = profiles
            .map(p => ({ name: p.name, distance: this.levenshteinDistance(input, p.name) }))
            .filter(p => p.distance <= 3)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3);
        if (similar.length > 0) {
            console.log('\n💡 Did you mean:');
            similar.forEach(p => console.log(`   • ${p.name}`));
        }
    }
    /**
     * Mask sensitive parts of URI
     */
    maskUri(uri) {
        return uri.replace(/:\/\/([^:@]+):([^@]+)@/, '://$1:***@');
    }
    /**
     * Format environment with color coding
     */
    formatEnvironment(env) {
        if (!env)
            return 'unknown';
        switch (env) {
            case 'production':
                return '🟥 production';
            case 'staging':
                return '🟨 staging';
            case 'development':
                return '🟦 development';
            case 'local':
                return '🟩 local';
            default:
                return `⚪ ${env}`;
        }
    }
    /**
     * Calculate Levenshtein distance for typo suggestions
     */
    levenshteinDistance(a, b) {
        const matrix = Array(b.length + 1)
            .fill(null)
            .map(() => Array(a.length + 1).fill(null));
        for (let i = 0; i <= a.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + cost);
            }
        }
        return matrix[b.length][a.length];
    }
}
exports.ProfileCommands = ProfileCommands;
