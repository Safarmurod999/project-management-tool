import { LoggerService } from '@nestjs/common';
import winston from 'winston';

export class NestLoggerAdapter implements LoggerService {
    constructor(private readonly logger: winston.Logger) {}
    log(message: any, ...meta: any[]) {
        this.logger.info(message, { meta });
    }
    error(message: any, trace?: string, context?: string) {
        this.logger.error(message, { trace, context });
    }
    warn(message: any, ...meta: any[]) {
        this.logger.warn(message, { meta });
    }
    debug(message: any, ...meta: any[]) {
        this.logger.debug(message, { meta });
    }
    verbose(message: any, ...meta: any[]) {
        this.logger.verbose(message, { meta });
    }
}