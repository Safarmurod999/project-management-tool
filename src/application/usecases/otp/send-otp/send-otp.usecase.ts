import { Inject, Injectable } from "@nestjs/common";
import { OtpConfig } from "src/config/otp-config";
import { OtpRepository } from "src/domain/otp/repository";
import { ClientSymbols, ConfigSymbols, RepositorySymbols } from "src/infrastructure";
import { SendOtpUsecase, SendOtpUsecaseParams } from "./types";
import { Otp } from "src/domain/otp/entity";
import { EmailClient } from "src/adapters";

@Injectable()
export class SendOtpUsecaseImpl implements SendOtpUsecase {
    constructor(
        @Inject(ConfigSymbols.OtpConfig)
        private readonly otpConfig: OtpConfig,

        @Inject(RepositorySymbols.OtpRepository)
        private readonly otpRepository: OtpRepository,

        @Inject(ClientSymbols.EmailClient)
        private readonly emailClient: EmailClient,
    ) {}

    public async execute(params: SendOtpUsecaseParams): Promise<Otp>{

        const otpCode = this.generateOtpCode();

        const expiresAt = new Date(Date.now() + this.otpConfig.getOtpValidTime());

        const otp = await this.otpRepository.create(
            {
                receiver: params.email,
                otpCode: otpCode,
                expiresAt,
            }
        )

        await this.emailClient.sendEmail({
            email: params.email,
            subject: "Your OTP Code",
            otpCode: otpCode,
            html: `<p>Your OTP code is <strong>${otpCode}</strong></p>`
        });

        return otp
    }

    private generateOtpCode(): string {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString();
    }
}
