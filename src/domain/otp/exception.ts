
export class OtpException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OtpException'
    }

    public static NotFoundByKey(key: string): OtpException {
        return new OtpException(`OTP not found with key: "${key}"`);
    }

    public static ExpiredOtp(): OtpException {
        return new OtpException(`This OTP is expired`);
    }

    public static InvalidOtp(): OtpException {
        return new OtpException(`This OTP is invalid`);
    }

    public static AttemptsLimitExceeded(): OtpException {
        return new OtpException(`You have reached limit of the attempts`);
    }
}
