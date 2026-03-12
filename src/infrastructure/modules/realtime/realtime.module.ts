import { Module } from '@nestjs/common';
import { RealtimeGateway } from 'src/adapters';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection';

@Module({
  providers: [
    RealtimeGateway,
    {
      provide: ServiceSymbols.RealtimeService,
      useExisting: RealtimeGateway,
    },
  ],
  exports: [ServiceSymbols.RealtimeService],
})
export class RealtimeModule {}
