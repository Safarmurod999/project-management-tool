import * as nodemailer from 'nodemailer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigSymbols } from 'src/infrastructure';
import { EmailClientConfig } from 'src/config';

export interface EmailClientSendParams {
  email: string;
  subject: string;
  otpCode: string;
  text?: string;
  html?: string;
}

export interface EmailClient {
  sendEmail(
    options: EmailClientSendParams,
  ): Promise<nodemailer.SentMessageInfo>;
}

@Injectable()
export class EmailClientImpl implements EmailClient {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(ConfigSymbols.EmailClient)
    private config: EmailClientConfig,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.getHost(),
      port: config.getPort(),
      secure: config.getSecure(),
      auth: config.getAuth(),
    });
  }

  public async sendEmail(
    options: EmailClientSendParams,
  ): Promise<nodemailer.SentMessageInfo> {
      const mailOptions = {
        from: this.config.getEmail(),
        to: options.email,
        subject: options.subject,
        html: options.html,
      };
      const result = await this.transporter.sendMail(mailOptions) as nodemailer.SentMessageInfo;

      this.transporter.close();

      return result;
  }
}
