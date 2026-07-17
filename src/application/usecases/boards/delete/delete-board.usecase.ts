import { Inject } from '@nestjs/common';
import { BoardRepository } from 'src/domain';
import { BoardException } from 'src/domain';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteBoardUsecase, DeleteBoardUsecaseParams } from './types';

export class DeleteBoardUsecaseImpl implements DeleteBoardUsecase {
  constructor(
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(params: DeleteBoardUsecaseParams): Promise<string> {
    const board = await this.boardRepository.findById(params.id);

    if (board.status === BoardStatus.ACTIVE) {
      throw BoardException.CannotDeleteActiveBoard(params.id);
    }

    return await this.boardRepository.delete(params.id);
  }
}
