import { MongoClient, Db } from 'mongodb';
import { MongoConfig, HealthCheckResult } from '../types';
export declare class MongoConnection {
    private config;
    private client;
    private db;
    private logger;
    constructor(config: MongoConfig, verbose?: boolean);
    connect(): Promise<{
        client: MongoClient;
        db: Db;
    }>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<HealthCheckResult>;
    listDatabases(): Promise<string[]>;
    listCollections(): Promise<string[]>;
    getClient(): MongoClient;
    getDb(): Db;
}
