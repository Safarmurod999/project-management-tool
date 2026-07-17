import { DeleteUserUsecaseImpl } from './delete-user-by-id.usecase';
import { UserRepository } from 'src/domain';
import { DeleteUserUsecaseParams } from './types';

describe('DeleteUserusecaseImpl', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: DeleteUserUsecaseImpl;

  beforeEach(() => {
    userRepository = {
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    usecase = new DeleteUserUsecaseImpl(userRepository);
  });

  it('should call userRepository.delete with correct id and return response', async () => {
    const params: DeleteUserUsecaseParams = { id: '12345' };
    const expectedResponse = 'User deleted successfully';

    userRepository.delete.mockResolvedValue(expectedResponse);

    const result = await usecase.execute(params);

    expect(userRepository.delete).toHaveBeenCalledWith(params.id);
    expect(result).toBe(expectedResponse);
  });
});
