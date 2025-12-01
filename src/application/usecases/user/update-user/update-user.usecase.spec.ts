import { UpdateUserUsecaseImpl } from './update-user.usecase';
import { UserRepository } from 'src/domain';
import { UpdateUserUsecaseParams } from './types';

describe('UpdateUserUsecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: UpdateUserUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      update: jest.fn(),
    } as any;

    usecase = new UpdateUserUsecaseImpl(userRepository);
  });

  it('should call userRepository.update with correct data and return updated user', async () => {
    const params: UpdateUserUsecaseParams = {
      id: '1',
      name: 'New Name',
      email: 'new@example.com',
      password: 'newpass',
      isVerified: true,
    };

    const updatedUser = {
      id: '1',
      name: params.name,
      email: params.email,
      password: params.password,
      isVerified: params.isVerified,
    };

    userRepository.update.mockResolvedValue(updatedUser as unknown as any);

    const result = await usecase.execute(params);

    expect(userRepository.update).toHaveBeenCalledWith(updatedUser);
    expect(result).toEqual(updatedUser);
  });
});
