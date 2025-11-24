import winston from "winston";
import { Module } from '@nestjs/common';
import { createLogger, LoggerAdapter } from "../../logger";
import { CommonSymbols } from "../../dependency-injection/common/symbols";

@Module({
    providers: [
        {
            provide: CommonSymbols.LoggerAdapter,
            useFactory: () => createLogger(),
        },
        {
            provide: CommonSymbols.Logger,
            useFactory: (logger: winston.Logger) => new LoggerAdapter(logger),
            inject: [CommonSymbols.LoggerAdapter],
        },
    ],
    exports: [CommonSymbols.Logger],
})
export class CommonModule {}
