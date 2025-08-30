export declare class Logger {
    private verbose;
    constructor(verbose?: boolean);
    info(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    step(step: number, total: number, message: string): void;
}
