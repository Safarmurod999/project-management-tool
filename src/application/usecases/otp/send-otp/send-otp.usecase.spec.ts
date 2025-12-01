import { SendOtpUsecaseImpl } from './send-otp.usecase';
import { OtpRepository } from 'src/domain/otp/repository';
import { OtpConfig } from 'src/config/otp-config';
import { EmailClient } from 'src/adapters';
import { SendOtpUsecaseParams } from './types';
import { Otp } from 'src/domain/otp/entity';

describe('SendOtpUsecaseImpl', () => {
  let usecase: SendOtpUsecaseImpl;

  let mockConfig: jest.Mocked<OtpConfig>;
  let mockRepository: jest.Mocked<OtpRepository>;
  let mockEmailClient: jest.Mocked<EmailClient>;

  beforeEach(() => {
    mockConfig = {
      getOtpValidTime: jest.fn().mockReturnValue(5 * 60 * 1000), // 5 minutes
    } as any;

    mockRepository = {
      create: jest.fn(),
    } as any;

    mockEmailClient = {
      sendEmail: jest.fn(),
    } as any;

    usecase = new SendOtpUsecaseImpl(
      mockConfig,
      mockRepository,
      mockEmailClient,
    );
  });

  it('should create OTP and send email', async () => {
    const params: SendOtpUsecaseParams = {
      email: "test@example.com",
    };

    const fakeOtp: Otp = {
      id: '1',
      receiver: params.email,
      otpCode: '123456',
      expiresAt: new Date(),
      createdAt: new Date(),
    } as unknown as Otp;

    mockRepository.create.mockResolvedValue(fakeOtp);
    mockEmailClient.sendEmail.mockResolvedValue({ messageId: 'msg123' });

    const result = await usecase.execute(params);

    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    const payload = mockRepository.create.mock.calls[0][0];

    expect(payload.receiver).toBe(params.email);
    expect(payload.otpCode).toHaveLength(6);
    expect(payload.expiresAt).toBeInstanceOf(Date);

    expect(mockEmailClient.sendEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailClient.sendEmail).toHaveBeenCalledWith({
      email: params.email,
      subject: 'Your OTP Code',
      otpCode: expect.any(String),
      html: expect.stringContaining('<strong'),
    });

    expect(result).toBe(fakeOtp);
  });

  it('should throw if email sending fails', async () => {
    mockRepository.create.mockResolvedValue({
      id: '1',
      receiver: 'test@example.com',
      otpCode: '111111',
      expiresAt: new Date(),
      createdAt: new Date(),
    } as unknown as Otp);

    mockEmailClient.sendEmail.mockRejectedValue(new Error('SMTP error'));

    await expect(
      usecase.execute({ email: 'test@example.com' })
    ).rejects.toThrow('SMTP error');
  });
});
