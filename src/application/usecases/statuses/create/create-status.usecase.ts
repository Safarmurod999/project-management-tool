import { Inject } from '@nestjs/common';
import { Status, StatusFactory, StatusRepository } from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FactorySymbols } from 'src/infrastructure/dependency-injection/factories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { CreateStatusUsecase, CreateStatusUsecaseParams } from './types';

export class CreateStatusUsecaseImpl implements CreateStatusUsecase {
  constructor(
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,

    @Inject(FactorySymbols.StatusFactory)
    private readonly statusFactory: StatusFactory,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: CreateStatusUsecaseParams): Promise<Status> {
    const data = this.statusFactory.create(params);

    const status = await this.transactionManager.run(async () => {
      // Only one status per project may be the default for new cards.
      if (data.isDefault) {
        await this.statusRepository.clearDefault(data.projectId);
      }

      return await this.statusRepository.create({
        projectId: data.projectId,
        name: data.name,
        code: data.code,
        color: data.color,
        order: data.order,
        isDefault: data.isDefault,
      });
    });

    this.socket.emitToRoom(
      `project:${status.projectId}`,
      'status:created',
      status,
    );

    return status;
  }
}
