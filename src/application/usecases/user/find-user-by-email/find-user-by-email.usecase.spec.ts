import { FindUserByEmailUsecaseImpl } from './find-user-by-email.usecase';
import { UserRepository } from 'src/domain';
import { FindUserByEmailUsecaseParams } from './types';

describe('FindUserByEmailUsecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: FindUserByEmailUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    usecase = new FindUserByEmailUsecaseImpl(userRepository);
  });

  it('should call userRepository.findByEmail with correct email and return user', async () => {
    const params: FindUserByEmailUsecaseParams = {
      email: 'john@example.com',
    };

    const foundUser = {
      id: '1',
      name: 'John Doe',
      email: params.email,
      password: 'hashed-password',
    };

    userRepository.findByEmail.mockResolvedValue(foundUser as unknown as any);

    const result = await usecase.execute(params);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(params.email);
    expect(result).toEqual(foundUser);
  });
});
