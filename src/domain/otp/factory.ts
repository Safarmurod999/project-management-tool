import { Injectable } from "@nestjs/common";
import { Otp } from "./entity";

export interface OtpStruct {
    id: string;
    receiver: string;
    otpCode: string;
    isVerified: boolean;
    attempts: number;
    expiresAt: Date;
}

export interface OtpFactory {
    create(organization: OtpStruct): Otp;
}

@Injectable()
export class OtpFactoryImpl implements OtpFactory {
    public create(otp: OtpStruct): Otp {
        return new Otp(
            otp.id,
            otp.receiver,
            otp.otpCode,
            otp.isVerified,
            otp.attempts,
            otp.expiresAt,
        )
    }
}
