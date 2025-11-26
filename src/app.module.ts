import { Module } from '@nestjs/common';
import { MainConfigModule, UserModule, OtpModule } from './infrastructure/modules';

@Module({
  imports: [MainConfigModule, UserModule, OtpModule],
})
export class AppModule {}
