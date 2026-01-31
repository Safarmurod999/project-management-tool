import { Inject } from '@nestjs/common';
import { UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteUserUsecase, DeleteUserUsecaseParams } from './types';

export class DeleteUserUsecaseImpl implements DeleteUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(params: DeleteUserUsecaseParams): Promise<string> {
    return await this.userRepository.delete(params.id);
  }
}
