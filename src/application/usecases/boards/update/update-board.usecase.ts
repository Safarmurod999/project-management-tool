import { Inject } from '@nestjs/common';
import { Board, BoardRepository } from 'src/domain';
import { BoardException } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateBoardUsecase, UpdateBoardUsecaseParams } from './types';

export class UpdateBoardUsecaseImpl implements UpdateBoardUsecase {
  constructor(
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(params: UpdateBoardUsecaseParams): Promise<Board> {
    const existingBoard = await this.boardRepository.findById(params.id);

    const projectId = params.projectId ?? existingBoard.projectId;
    const name = params.name ?? existingBoard.name;

    if (params.name || params.projectId) {
      const duplicate = await this.boardRepository.find({
        page: 1,
        limit: 1,
        projectId,
        name,
      });

      if (
        duplicate.data.length > 0 &&
        duplicate.data[0].id !== existingBoard.id
      ) {
        throw BoardException.BoardAlreadyExists(name, projectId);
      }
    }

    return await this.boardRepository.update({
      id: params.id,
      name: params.name,
      description: params.description,
      projectId: params.projectId,
      status: params.status,
      version: params.version,
    });
  }
}
