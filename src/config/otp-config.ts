import { Injectable } from "@nestjs/common";
import { AbstractConfig } from "./abstract-config";

export interface OtpConfig {
    getOtpCacheTtl(): string;
    getOtpValidTime(): number;
    getMaxAttempts(): number;
}

@Injectable()
export class OtpConfigImpl extends AbstractConfig implements OtpConfig {
    private readonly otpCacheTtl: string;
    private readonly otpValidTime: number;
    private readonly maxAttempts: number

    constructor() {
        super();

        this.otpCacheTtl = process.env.OTP_CACHE_TTL!;
        this.otpValidTime = Number(process.env.OTP_VALID_TIME || 0);
        this.maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 0);

        this.validateEnvs();
    }

    public getOtpCacheTtl(): string {
        return this.otpCacheTtl;
    }

    public getOtpValidTime(): number {
        return this.otpValidTime;
    }

    public getMaxAttempts(): number {
        return this.maxAttempts;
    }

    private validateEnvs(): void {
        if(!this.otpCacheTtl) {
            this.throwEnvError("OTP_CACHE_TTL");
        }

        if(!this.otpValidTime) {
            this.throwEnvError("OTP_VALID_TIME");
        }

        if (!this.maxAttempts) {
            this.throwEnvError("OTP_MAX_ATTEMPTS");
        }
    }
}
