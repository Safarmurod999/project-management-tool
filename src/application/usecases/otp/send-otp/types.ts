import { Otp } from "src/domain";

export interface SendOtpUsecaseParams {
  email: string;
}

export interface SendOtpUsecase {
  execute(params: SendOtpUsecaseParams): Promise<Otp>;
}