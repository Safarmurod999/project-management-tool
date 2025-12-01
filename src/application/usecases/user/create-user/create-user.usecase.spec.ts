import { CreateUserUsecaseImpl } from './create-user.usecase';
import { UserRepository } from 'src/domain';
import { CreateUserUsecaseParams } from './types';

describe('CreateUserUsecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: CreateUserUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
    } as any;

    usecase = new CreateUserUsecaseImpl(userRepository);
  });

  it('should call userRepository.create() with correct params and return created user', async () => {
    const params: CreateUserUsecaseParams = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123456',
    };

    const createdUser = {
      id: '123',
      ...params,
    };

    userRepository.create.mockResolvedValue(createdUser as unknown as any);

    const result = await usecase.execute(params);

    expect(userRepository.create).toHaveBeenCalledWith({
      name: params.name,
      email: params.email,
      password: params.password,
    });

    expect(result).toEqual(createdUser);
  });
});
