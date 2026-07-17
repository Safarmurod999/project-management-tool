import { Inject } from '@nestjs/common';
import { Board, BoardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateBoardUsecase, CreateBoardUsecaseParams } from './types';
import { Logger, ServiceSymbols } from 'src/infrastructure';
import { RealtimeService } from 'src/application/services';
import { CommonSymbols } from 'src/infrastructure/dependency-injection/common/symbol';

export class CreateBoardUsecaseImpl implements CreateBoardUsecase {
  constructor(
    @Inject(CommonSymbols.Logger)
    private logger: Logger,

    @Inject(RepositorySymbols.BoardRepository)
    private boardRepository: BoardRepository,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: CreateBoardUsecaseParams): Promise<Board> {
    const board = await this.boardRepository.create({
      projectId: params.projectId,
      name: params.name,
      description: params.description,
    });

    this.logger.info(`project:${params.projectId}`);

    this.socket.emitToRoom(
      `project:${params.projectId}`,
      `board:created`,
      board,
    );

    return board;
  }
}
