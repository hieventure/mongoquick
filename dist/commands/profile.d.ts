/**
 * Profile Management CLI Commands - Expert DX Design
 * Features: Smart auto-completion, rich output, error handling, progressive disclosure
 */
interface ProfileCommandOptions {
    verbose?: boolean;
    json?: boolean;
    format?: 'table' | 'json' | 'compact';
}
export declare class ProfileCommands {
    private store;
    private manager;
    /**
     * Add new connection profile with smart validation
     */
    add(options: {
        name: string;
        uri: string;
        database?: string;
        alias?: string;
        environment?: string;
        setDefault?: boolean;
    }): Promise<void>;
    /**
     * List profiles with rich formatting
     */
    list(options?: ProfileCommandOptions): Promise<void>;
    /**
     * Test single or all profiles
     */
    test(profileName?: string, options?: ProfileCommandOptions): Promise<void>;
    /**
     * Use/switch to profile
     */
    use(profileName: string): Promise<void>;
    /**
     * Remove profile with confirmation
     */
    remove(profileName: string, options?: {
        force?: boolean;
    }): Promise<void>;
    /**
     * Show current/default profile
     */
    current(): Promise<void>;
    /**
     * Export profiles
     */
    export(): Promise<void>;
    /**
     * Smart URI enhancement
     */
    private enhanceUri;
    /**
     * Auto-detect environment from name and URI
     */
    private detectEnvironment;
    /**
     * Display profiles in beautiful table format
     */
    private displayProfilesTable;
    /**
     * Test single profile with detailed output
     */
    private testSingleProfile;
    /**
     * Test all profiles concurrently
     */
    private testAllProfiles;
    /**
     * Suggest similar profile names for typos
     */
    private suggestSimilarProfiles;
    /**
     * Mask sensitive parts of URI
     */
    private maskUri;
    /**
     * Format environment with color coding
     */
    private formatEnvironment;
    /**
     * Calculate Levenshtein distance for typo suggestions
     */
    private levenshteinDistance;
}
export {};
