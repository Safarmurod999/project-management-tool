import { Inject } from '@nestjs/common';
import {
  Board,
  BoardRepository,
  buildDefaultStatuses,
  ColumnRepository,
  ColumnStatusRepository,
  DEFAULT_COLUMNS,
  ProjectRepository,
  Status,
  StatusRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateBoardUsecase, CreateBoardUsecaseParams } from './types';
import { Logger, ServiceSymbols } from 'src/infrastructure';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { CommonSymbols } from 'src/infrastructure/dependency-injection/common/symbol';

export class CreateBoardUsecaseImpl implements CreateBoardUsecase {
  constructor(
    @Inject(CommonSymbols.Logger)
    private logger: Logger,

    @Inject(RepositorySymbols.BoardRepository)
    private boardRepository: BoardRepository,

    @Inject(RepositorySymbols.ProjectRepository)
    private readonly projectRepository: ProjectRepository,

    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,

    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,

    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: CreateBoardUsecaseParams): Promise<Board> {
    await this.projectRepository.findById(params.projectId);

    const board = await this.transactionManager.run(async () => {
      const board = await this.boardRepository.create({
        projectId: params.projectId,
        name: params.name,
        description: params.description,
      });

      const statuses = await this.getProjectStatuses(params.projectId);
      await this.createDefaultColumns(board.id, statuses);

      return board;
    });

    this.logger.info(`project:${params.projectId}`);

    this.socket.emitToRoom(
      `project:${params.projectId}`,
      `board:created`,
      board,
    );

    return board;
  }

  /**
   * Statuses are shared by all boards of a project and are seeded when the
   * project is created. Projects created before statuses existed get the
   * defaults here, exactly once.
   */
  private async getProjectStatuses(projectId: string): Promise<Status[]> {
    const statuses = await this.statusRepository.findByProjectId(projectId);

    if (statuses.length > 0) {
      return statuses;
    }

    return await this.statusRepository.createMany(
      buildDefaultStatuses(projectId),
    );
  }

  private async createDefaultColumns(
    boardId: string,
    statuses: Status[],
  ): Promise<void> {
    const statusByCode = new Map(
      statuses.map((status) => [status.code, status]),
    );

    for (const [columnOrder, definition] of DEFAULT_COLUMNS.entries()) {
      const column = await this.columnRepository.create({
        boardId,
        name: definition.name,
        order: columnOrder,
      });

      // Codes a project has removed or renamed are skipped, not recreated.
      const columnStatuses = definition.statusCodes
        .map((code) => statusByCode.get(code))
        .filter((status): status is Status => status !== undefined);

      for (const [order, status] of columnStatuses.entries()) {
        await this.columnStatusRepository.create({
          columnId: column.id,
          statusId: status.id,
          order,
        });
      }
    }
  }
}
