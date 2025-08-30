import { MongoConfig } from '../types';
export declare const DEFAULT_MONGO_CONFIG: Partial<MongoConfig>;
export declare const COMMON_INDEXES: {
    users: ({
        keys: {
            email: 1;
            createdAt?: undefined;
        };
        options: {
            unique: boolean;
            name: string;
        };
    } | {
        keys: {
            createdAt: 1;
            email?: undefined;
        };
        options: {
            name: string;
            unique?: undefined;
        };
    })[];
    sessions: ({
        keys: {
            sessionToken: 1;
            expiresAt?: undefined;
        };
        options: {
            unique: boolean;
            name: string;
            expireAfterSeconds?: undefined;
        };
    } | {
        keys: {
            expiresAt: 1;
            sessionToken?: undefined;
        };
        options: {
            expireAfterSeconds: number;
            name: string;
            unique?: undefined;
        };
    })[];
    events: {
        keys: {
            status: 1;
            startDate: 1;
        };
        options: {
            name: string;
        };
    }[];
    teams: {
        keys: {
            eventId: 1;
            teamCode: 1;
        };
        options: {
            unique: boolean;
            name: string;
        };
    }[];
    votes: {
        keys: {
            userId: 1;
            teamId: 1;
        };
        options: {
            unique: boolean;
            name: string;
        };
    }[];
};
export declare function createMongoConfigFromEnv(): MongoConfig;
