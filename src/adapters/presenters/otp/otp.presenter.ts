import { Injectable } from "@nestjs/common";
import { Otp } from "../../../domain/otp";

export interface OtpToken{
    token: string;
}
export interface OtpPresenter {
    present(otp: Otp): OtpToken;
}

@Injectable()
export class OtpPresenterImpl implements OtpPresenter {
    public present(otp: Otp): OtpToken {
        return {
            token: otp.id,
        }
    }
}
