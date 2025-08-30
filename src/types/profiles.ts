/**
 * Smart Connection Management Types
 * Expert-level MongoDB connection handling with type safety
 */

export interface ConnectionProfile {
  readonly name: string;
  readonly uri: string;
  readonly database?: string;
  readonly alias?: string;
  readonly tags?: readonly string[];
  readonly options?: MongoConnectionOptions;
  readonly metadata?: ProfileMetadata;
}

export interface MongoConnectionOptions {
  readonly maxPoolSize?: number;
  readonly minPoolSize?: number;
  readonly maxIdleTimeMS?: number;
  readonly serverSelectionTimeoutMS?: number;
  readonly connectTimeoutMS?: number;
  readonly heartbeatFrequencyMS?: number;
  readonly retryWrites?: boolean;
  readonly retryReads?: boolean;
  readonly ssl?: boolean;
  readonly sslCA?: string;
  readonly sslCert?: string;
  readonly sslKey?: string;
  readonly authSource?: string;
  readonly authMechanism?: 'SCRAM-SHA-1' | 'SCRAM-SHA-256' | 'MONGODB-X509' | 'GSSAPI' | 'PLAIN';
}

export interface ProfileMetadata {
  readonly createdAt?: Date;
  readonly lastUsed?: Date;
  readonly lastTested?: Date;
  readonly environment?: 'local' | 'development' | 'staging' | 'production' | string;
  readonly description?: string;
  readonly isDefault?: boolean;
}

export interface ConnectionHealth {
  readonly isConnected: boolean;
  readonly latency: number;
  readonly serverVersion: string;
  readonly replicaSet?: string;
  readonly topology:
    | 'Single'
    | 'ReplicaSetNoPrimary'
    | 'ReplicaSetWithPrimary'
    | 'Sharded'
    | 'Unknown';
  readonly connectionCount: number;
  readonly testedAt: Date;
  readonly error?: string;
}

export interface ProfileStore {
  list(): Promise<readonly ConnectionProfile[]>;
  get(name: string): Promise<ConnectionProfile | null>;
  add(profile: ConnectionProfile): Promise<void>;
  remove(name: string): Promise<boolean>;
  update(name: string, profile: Partial<ConnectionProfile>): Promise<boolean>;
  setDefault(name: string): Promise<boolean>;
  getDefault(): Promise<ConnectionProfile | null>;
  export(): Promise<string>;
  import(data: string): Promise<number>;
}

export interface ConnectionManager {
  connect(profile: ConnectionProfile): Promise<void>;
  disconnect(profileName?: string): Promise<void>;
  test(profile: ConnectionProfile): Promise<ConnectionHealth>;
  getHealth(profileName: string): Promise<ConnectionHealth | null>;
  listConnections(): Promise<Map<string, ConnectionHealth>>;
  cleanup(): Promise<void>;
}

export interface SmartConnectionResult {
  readonly success: boolean;
  readonly profile: ConnectionProfile;
  readonly health?: ConnectionHealth;
  readonly error?: string;
  readonly suggestions?: readonly string[];
}
