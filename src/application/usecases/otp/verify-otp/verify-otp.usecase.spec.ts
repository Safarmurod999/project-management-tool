import { VerifyOtpUsecaseImpl } from './verify-otp.usecase';
import { OtpException } from 'src/domain';
import { Otp } from 'src/domain/otp/entity';
import { OtpRepository } from 'src/domain/otp/repository';
import { OtpConfig } from 'src/config/otp-config';

describe('VerifyOtpUsecaseImpl (pure unit test)', () => {
  let usecase: VerifyOtpUsecaseImpl;
  let otpRepository: jest.Mocked<OtpRepository>;
  let otpConfig: jest.Mocked<OtpConfig>;

  beforeEach(() => {
    otpRepository = {
      get: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<OtpRepository>;

    otpConfig = {
      getMaxAttempts: jest.fn().mockReturnValue(3),
    } as unknown as jest.Mocked<OtpConfig>;
    usecase = new VerifyOtpUsecaseImpl(otpConfig, otpRepository);
  });

  const mockOtp = (data: Partial<Otp>): Otp =>
    ({
      isExpired: () => data.isExpired ?? false,
      isOutOfLimit: () => data.isOutOfLimit ?? false,
      verifyCode: () => data.verifyCode ?? true,
      increaseAttempts: jest.fn(),
      setVerified: jest.fn(),
    }) as unknown as Otp;

  it('should throw ExpiredOtp if otp is expired', async () => {
    otpRepository.get.mockResolvedValue(mockOtp({ isExpired:() => true }));

    await expect(
      usecase.execute({ token: '123', otpCode: '1111' }),
    ).rejects.toThrow(OtpException.ExpiredOtp());
  });

  it('should throw AttemptsLimitExceeded when attempts exceed limit', async () => {
    otpRepository.get.mockResolvedValue(
      mockOtp({ isExpired: false, isOutOfLimit: () => true } as unknown as Otp),
    );

    await expect(
      usecase.execute({ token: '123', otpCode: '1111' }),
    ).rejects.toThrow(OtpException.AttemptsLimitExceeded());
  });

  it('should increase attempts and throw InvalidOtp on wrong otp code', async () => {
    const otp = mockOtp({
      isExpired: false,
      isOutOfLimit: false,
      verifyCode: false,
    } as unknown as Otp);

    otpRepository.get.mockResolvedValue(otp);

    await expect(
      usecase.execute({ token: '123', otpCode: 'wrong' }),
    ).rejects.toThrow(OtpException.InvalidOtp());

    expect(otp.increaseAttempts).toHaveBeenCalled();
    expect(otpRepository.update).toHaveBeenCalledWith(otp);
  });

  it('should verify otp and return otp if code is correct', async () => {
    const otp = mockOtp({
      isExpired: false,
      isOutOfLimit: false,
      verifyCode: true,
    } as unknown as Otp);

    otpRepository.get.mockResolvedValue(otp);

    const result = await usecase.execute({
      token: 'abc',
      otpCode: '1234',
    });

    expect(otp.setVerified).toHaveBeenCalled();
    expect(otpRepository.update).toHaveBeenCalledWith(otp);
    expect(result).toBe(otp);
  });
});
