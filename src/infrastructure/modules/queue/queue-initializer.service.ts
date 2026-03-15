import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { BullMQService } from '../../queue/bullmq.service';
import { EmailJobProcessor } from '../../queue/processors/email.processor';

@Injectable()
export class QueueInitializerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('BullMQService')
    private readonly bullMQService: BullMQService,
    private readonly emailProcessor: EmailJobProcessor,
  ) {}

  async onModuleInit(): Promise<void> {
    console.log('Initializing BullMQ queues and workers...');

    // Create email queue and worker
    this.bullMQService.createQueue('email');
    this.bullMQService.createWorker(
      'email',
      this.emailProcessor.process.bind(this.emailProcessor),
      { concurrency: 3 } // Process up to 3 email jobs concurrently
    );

    console.log('BullMQ queues and workers initialized successfully');
  }

  async onModuleDestroy(): Promise<void> {
    console.log('Shutting down BullMQ queues and workers...');
    await this.bullMQService.closeAll();
    console.log('BullMQ shutdown complete');
  }
}