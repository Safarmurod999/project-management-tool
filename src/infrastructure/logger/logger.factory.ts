import * as winston from 'winston';

export function createLogger() {
    return winston.createLogger({
        level: process.env.LOG_LEVEL ?? 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.Console()
            // add file
        ],
    });
}