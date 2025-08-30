import { InitOptions } from '../types';
export declare class MongoInitializer {
    private options;
    private connection;
    private logger;
    constructor(options: InitOptions);
    initialize(): Promise<void>;
    private performHealthCheck;
    private ensureDatabaseExists;
    private createUsers;
    checkConnection(): Promise<boolean>;
}
