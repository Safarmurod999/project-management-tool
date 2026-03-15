import { Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailClient } from '../../../adapters/clients/email-client';
import { ClientSymbols } from '../../../infrastructure/dependency-injection';

export interface EmailJobData {
  email: string;
  subject: string;
  otpCode: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailJobProcessor {
  constructor(
    @Inject(ClientSymbols.EmailClient)
    private readonly emailClient: EmailClient,
  ) {}

  async process(job: Job<EmailJobData>): Promise<void> {
    const { email, subject, otpCode, text, html } = job.data;

    try {
      console.log(`Processing email job ${job.id} for ${email}`);

      await this.emailClient.sendEmail({
        email,
        subject,
        otpCode,
        text,
        html,
      });

      console.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`Email job ${job.id} failed:`, error);
      throw error; // Re-throw to mark job as failed
    }
  }
}