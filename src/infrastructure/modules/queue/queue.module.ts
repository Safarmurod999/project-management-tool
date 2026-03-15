import { Module } from '@nestjs/common';
import { BullMQService } from '../../queue/bullmq.service';
import { QueueInitializerService } from './queue-initializer.service';
import { EmailJobProcessor } from '../../queue/processors/email.processor';
import { MainConfigModule } from '../config/config.module';

@Module({
  imports: [MainConfigModule],
  providers: [
    {
      provide: 'BullMQService',
      useClass: BullMQService,
    },
    QueueInitializerService,
    EmailJobProcessor,
  ],
  exports: ['BullMQService', QueueInitializerService, EmailJobProcessor],
})
export class QueueModule {}