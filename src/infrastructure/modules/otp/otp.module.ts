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
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [OtpController],
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
      provide: UsecaseSymbols.Otp.SendOtpUsecase,
      useClass: SendOtpUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Otp.OtpPresenter,
      useClass: OtpPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Otp.VerifyOtpUsecase,
      useClass: VerifyOtpUsecaseImpl,
    }
  ],
  exports: [ConfigSymbols.OtpConfig, RepositorySymbols.OtpRepository, UsecaseSymbols.Otp.SendOtpUsecase, UsecaseSymbols.Otp.VerifyOtpUsecase],
})
export class OtpModule {}
