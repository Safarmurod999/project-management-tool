import winston from 'winston';
import { ILogger } from './logger.interface';

export class LoggerAdapter implements ILogger {
    constructor(
        private readonly logger: winston.Logger,
        private readonly context: Record<string, any> = {}
    ) {}

    log(message: string, meta: Record<string, any> = {}) {
        this.logger.log(message, { ...this.context, ...meta });
    }
    debug(message: string, meta: Record<string, any> = {}) {
        this.logger.debug(message, { ...this.context, ...meta });
    }
    info(message: string, meta: Record<string, any> = {}) {
        this.logger.info(message, { ...this.context, ...meta });
    }
    warn(message: string, meta: Record<string, any> = {}) {
        this.logger.warn(message, { ...this.context, ...meta });
    }
    error(message: string, meta: Record<string, any> = {}) {
        this.logger.error(message, { ...this.context, ...meta });
    }

    child(meta: Record<string, any> = {}): ILogger {
        return new LoggerAdapter(this.logger, { ...this.context, ...meta });
    }
}