import { Module } from '@nestjs/common';
import { EmailClientConfigImpl, OtpConfigImpl } from 'src/config';
import {
  OtpController,
  OtpPresenterImpl,
} from 'src/adapters';
import { OtpFactoryImpl, OtpRepositoryImpl } from 'src/domain';
import {
  ClientSymbols,
  ConfigSymbols,
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { SendOtpUsecaseImpl } from 'src/application';
import { EmailClientImpl } from 'src/adapters';
import { MainConfigModule } from '../config/config.module';

@Module({
  controllers: [OtpController],
  imports: [MainConfigModule],
  providers: [
    {
      provide: ConfigSymbols.OtpConfig,
      useClass: OtpConfigImpl,
    },
    {
      provide: FactorySymbols.OtpFactory,
      useClass: OtpFactoryImpl,
    },
    {
      provide: RepositorySymbols.OtpRepository,
      useClass: OtpRepositoryImpl,
    },
    {
      provide: ConfigSymbols.EmailClient,
      useClass: EmailClientConfigImpl,
    },
    {
      provide: ClientSymbols.EmailClient,
      useClass: EmailClientImpl,
    },
    {
      provide: UsecaseSymbols.SendOtpUsecase,
      useClass: SendOtpUsecaseImpl,
    },
    {
      provide: PresenterSymbols.OtpPresenter,
      useClass: OtpPresenterImpl,
    }
  ],
})
export class OtpModule {}
