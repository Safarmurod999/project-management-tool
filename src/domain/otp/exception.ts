
export class OtpException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'OtpException';
    this.statusCode = statusCode;
  }

  public static NotFoundByKey(key: string): OtpException {
    return new OtpException(`OTP not found with key: "${key}"`, 404);
  }

  public static ExpiredOtp(): OtpException {
    return new OtpException(`This OTP is expired`, 410);
  }

  public static InvalidOtp(): OtpException {
    return new OtpException(`This OTP is invalid`, 400);
  }

  public static AttemptsLimitExceeded(): OtpException {
    return new OtpException(`You have reached limit of the attempts`, 429);
  }

  public static OtpAlreadyUsed(): OtpException {
    return new OtpException(`This OTP has already been used`, 409);
  }

  public static TooManyRequests(): OtpException {
    return new OtpException(`Too many OTP requests. Please try again later`, 429);
  }

  public static InvalidOtpFormat(): OtpException {
    return new OtpException(`Invalid OTP format`, 400);
  }

  public static OtpGenerationFailed(): OtpException {
    return new OtpException(`Failed to generate OTP`, 500);
  }
}
