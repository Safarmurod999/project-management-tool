import { Inject } from '@nestjs/common';
import { Board, BoardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindBoardByIdUsecase, FindBoardByIdUsecaseParams } from './types';

export class FindBoardByIdUsecaseImpl implements FindBoardByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(params: FindBoardByIdUsecaseParams): Promise<Board> {
    return await this.boardRepository.findById(params.id);
  }
}
