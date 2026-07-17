import { UpdateUserUsecaseImpl } from './update-user.usecase';
import { User, UserRepository } from 'src/domain';
import { UpdateUserUsecaseParams } from './types';
import { UserStatus } from 'src/infrastructure/common/enum';
import { PasswordService } from 'src/infrastructure/helpers';

describe('UpdateUserUsecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let usecase: UpdateUserUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      update: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    passwordService = {
      hashPassword: jest.fn(),
      comparePassword: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    usecase = new UpdateUserUsecaseImpl(userRepository, passwordService);
  });

  it('should call userRepository.update with correct data and return updated user', async () => {
    const params: UpdateUserUsecaseParams = {
      id: '1',
      name: 'New Name',
      email: 'new@example.com',
      password: 'newpass',
      role: 'role123',
      isVerified: true,
      status: UserStatus.ACTIVE,
    };

    const hashedPassword = 'hashed-newpass';
    const updatedUser = {
      id: '1',
      name: params.name,
      email: params.email,
      password: hashedPassword,
      role: params.role,
      isVerified: params.isVerified,
      status: params.status,
    };

    passwordService.hashPassword.mockResolvedValue(hashedPassword);
    userRepository.update.mockResolvedValue(updatedUser as unknown as User);

    const result = await usecase.execute(params);

    expect(passwordService.hashPassword).toHaveBeenCalledWith(params.password);
    expect(userRepository.update).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });

  it('should not hash password when password is not provided', async () => {
    const params: UpdateUserUsecaseParams = {
      id: '1',
      name: 'New Name',
      email: 'new@example.com',
      role: 'role123',
      isVerified: true,
      status: UserStatus.ACTIVE,
    };

    const updatedUser = {
      id: '1',
      name: params.name,
      email: params.email,
      password: undefined,
      role: params.role,
      isVerified: params.isVerified,
      status: params.status,
    };

    userRepository.update.mockResolvedValue(updatedUser as unknown as User);

    const result = await usecase.execute(params);

    expect(passwordService.hashPassword).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });
});
