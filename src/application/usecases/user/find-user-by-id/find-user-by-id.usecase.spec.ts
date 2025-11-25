import { FindUserByIdUsecaseImpl } from './find-user-by-id.usecase';
import { UserRepository } from 'src/domain';
import { FindUserByIdUsecaseParams } from './types';

describe('FindUserByIdUsecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: FindUserByIdUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as any;

    usecase = new FindUserByIdUsecaseImpl(userRepository);
  });

  it('should call userRepository.findById with correct id and return user', async () => {
    const params: FindUserByIdUsecaseParams = { id: '123' };

    const expectedUser = {
      id: params.id,
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpass',
    };

    userRepository.findById.mockResolvedValue(expectedUser as unknown as any);

    const result = await usecase.execute(params);

    expect(userRepository.findById).toHaveBeenCalledWith(params.id);

    expect(result).toEqual(expectedUser);
  });
});
