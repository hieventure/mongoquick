/**
 * Secure Profile Storage - Expert MongoDB Connection Management
 * Features: Encryption, validation, atomic operations, zero-copy reads
 */
import type { ConnectionProfile, ProfileStore } from '../types/profiles';
export declare class SecureProfileStore implements ProfileStore {
    private readonly configDir;
    private readonly profilesFile;
    private cachedProfiles;
    private lastModified;
    constructor(configDir?: string);
    /**
     * List all profiles with lazy loading and caching
     */
    list(): Promise<readonly ConnectionProfile[]>;
    /**
     * Get specific profile with O(1) lookup
     */
    get(name: string): Promise<ConnectionProfile | null>;
    /**
     * Add new profile with validation and atomic write
     */
    add(profile: ConnectionProfile): Promise<void>;
    /**
     * Remove profile with cascade cleanup
     */
    remove(name: string): Promise<boolean>;
    /**
     * Update profile with partial merge
     */
    update(name: string, updates: Partial<ConnectionProfile>): Promise<boolean>;
    /**
     * Set default profile with atomic operation
     */
    setDefault(name: string): Promise<boolean>;
    /**
     * Get default profile with cache optimization
     */
    getDefault(): Promise<ConnectionProfile | null>;
    /**
     * Export profiles as encrypted JSON
     */
    export(): Promise<string>;
    /**
     * Import profiles with validation and merge strategy
     */
    import(data: string): Promise<number>;
    /**
     * Load profiles with smart caching and file change detection
     */
    private loadProfiles;
    /**
     * Load storage with automatic directory creation
     */
    private loadStorage;
    /**
     * Save profiles with atomic write and encryption
     */
    private saveProfiles;
    /**
     * Encrypt sensitive profile data
     */
    private encryptProfile;
    /**
     * Decrypt profile data
     */
    private decryptProfile;
    /**
     * Get encryption key with fallback
     */
    private getEncryptionKey;
    /**
     * Validate profile with comprehensive checks
     */
    private validateProfile;
}
