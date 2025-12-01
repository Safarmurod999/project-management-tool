export class Otp {
    constructor(
        private readonly _id: string,
        private readonly _receiver: string,
        private readonly _otpCode: string,
        private _isVerified: boolean,
        private _attempts: number,
        private readonly _expiresAt: Date,
    ) {}

    public get id(): string {
        return this._id;
    }

    public get receiver(): string {
        return this._receiver;
    }

    public get otpCode(): string {
        return this._otpCode;
    }
    
    public get isVerified(): boolean {
        return this._isVerified;
    }

    public get attempts(): number {
        return this._attempts;
    }

    public get expiresAt(): Date{
        return this._expiresAt;
    }

    public verifyCode(otpCode: string): boolean {
        return this._otpCode === otpCode;
    }

    public setVerified(): void {
        this._isVerified = true;
    }

    public isExpired(): boolean {
        return new Date() > this.expiresAt
    }

    public isOutOfLimit(maxAttempts: number): boolean {
        return this._attempts >= maxAttempts;
    }

    public increaseAttempts(): void {
        this._attempts++;
    }
}
