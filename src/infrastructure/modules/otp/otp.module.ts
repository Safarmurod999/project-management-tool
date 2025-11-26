import { Module } from '@nestjs/common';
import { OtpConfigImpl } from 'src/config';
import {
  OtpController,
  OtpPresenterImpl,
} from 'src/adapters';
import { OtpFactoryImpl, OtpRepositoryImpl } from 'src/domain';
import {
  ConfigSymbols,
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { SendOtpUsecaseImpl, VerifyOtpUsecaseImpl } from 'src/application';
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
      provide: UsecaseSymbols.SendOtpUsecase,
      useClass: SendOtpUsecaseImpl,
    },
    {
      provide: PresenterSymbols.OtpPresenter,
      useClass: OtpPresenterImpl,
    },
    {
      provide: UsecaseSymbols.VerifyOtpUsecase,
      useClass: VerifyOtpUsecaseImpl,
    }
  ],
})
export class OtpModule {}
