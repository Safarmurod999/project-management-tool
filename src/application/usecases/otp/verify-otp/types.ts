import { Otp } from "src/domain";

export interface VerifyOtpUsecaseParams {
    token: string;
    otpCode: string;
}

export interface VerifyOtpUsecase {
    execute(params: VerifyOtpUsecaseParams): Promise<Otp>;
}