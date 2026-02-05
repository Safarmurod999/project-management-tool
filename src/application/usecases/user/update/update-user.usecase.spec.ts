import { UpdateUserUsecaseImpl } from './update-user.usecase';
import { User, UserRepository } from 'src/domain';
import { UpdateUserUsecaseParams } from './types';
import { UserStatus } from 'src/infrastructure/common/enum';

describe('UpdateUserUsecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: UpdateUserUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      update: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    usecase = new UpdateUserUsecaseImpl(userRepository);
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

    const updatedUser = {
      id: '1',
      name: params.name,
      email: params.email,
      password: params.password,
      role: params.role,
      isVerified: params.isVerified,
      status: params.status,
    };

    userRepository.update.mockResolvedValue(updatedUser as unknown as User);

    const result = await usecase.execute(params);

    expect(userRepository.update).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });
});
