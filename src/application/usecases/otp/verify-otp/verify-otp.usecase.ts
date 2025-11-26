import { Inject, Injectable } from "@nestjs/common";
import { VerifyOtpUsecase, VerifyOtpUsecaseParams } from "./types";
import { ConfigSymbols, RepositorySymbols } from "src/infrastructure";
import { OtpConfig } from "src/config";
import { Otp, OtpException, OtpRepository } from "src/domain";

@Injectable()
export class VerifyOtpUsecaseImpl implements VerifyOtpUsecase {
    constructor(
        @Inject(ConfigSymbols.OtpConfig)
        private readonly otpConfig: OtpConfig,

        @Inject(RepositorySymbols.OtpRepository)
        private readonly otpRepository: OtpRepository,
    ) {}

    public async execute(params: VerifyOtpUsecaseParams): Promise<Otp> {
        const otp = await this.otpRepository.get(params.token);

        if (otp.isExpired()) {
            throw OtpException.ExpiredOtp();
        }

        if (otp.isOutOfLimit(this.otpConfig.getMaxAttempts())){
            throw OtpException.AttemptsLimitExceeded();
        }

        const isVerified = otp.verifyCode(params.otpCode);

        if (!isVerified) {
            otp.increaseAttempts();
            await this.otpRepository.update(otp)
            throw OtpException.InvalidOtp()
        }

        otp.setVerified();
        await this.otpRepository.update(otp);
        return otp
    }
}
