import { Inject } from '@nestjs/common';
import { BoardRepository, ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetBoardDetailsUsecase, GetBoardDetailsUsecaseParams } from './types';

export class GetBoardDetailsUsecaseImpl implements GetBoardDetailsUsecase {
  constructor(
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
    @Inject(RepositorySymbols.ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(params: GetBoardDetailsUsecaseParams) {
    const board = await this.boardRepository.findById(params.id);
    const project = await this.projectRepository.findById(board.projectId);

    return { board, project };
  }
}
