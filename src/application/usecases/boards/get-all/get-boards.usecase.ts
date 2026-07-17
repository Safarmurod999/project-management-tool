import { Inject } from '@nestjs/common';
import { BoardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetBoardsUsecase, GetBoardsUsecaseParams } from './types';

export class GetBoardsUsecaseImpl implements GetBoardsUsecase {
  constructor(
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(params: GetBoardsUsecaseParams) {
    return await this.boardRepository.find(params);
  }
}
