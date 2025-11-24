export interface ILogger {
    log(message: string, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
    child?(meta: Record<string, any>): ILogger; // optional helper to create per-request logger
}