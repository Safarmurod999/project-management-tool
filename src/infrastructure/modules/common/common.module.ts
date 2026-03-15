import winston from "winston";
import { Module } from '@nestjs/common';
import { createLogger, LoggerAdapter } from "../../logger";
import { CommonSymbols } from "src/infrastructure/dependency-injection/common/symbol";
import { BcryptPasswordService } from "../../helpers/bcrypt-password-service/bcrypt-password-service";
import { ServiceSymbols } from "../../dependency-injection/services/symbol";

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
        {
            provide: ServiceSymbols.PasswordService,
            useClass: BcryptPasswordService,
        },
    ],
    exports: [CommonSymbols.Logger, ServiceSymbols.PasswordService],
})
export class CommonModule {}
