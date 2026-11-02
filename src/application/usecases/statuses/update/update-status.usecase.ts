import { Inject } from '@nestjs/common';
import { Status, StatusFactory, StatusRepository } from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FactorySymbols } from 'src/infrastructure/dependency-injection/factories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { UpdateStatusUsecase, UpdateStatusUsecaseParams } from './types';

export class UpdateStatusUsecaseImpl implements UpdateStatusUsecase {
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

  async execute(params: UpdateStatusUsecaseParams): Promise<Status> {
    this.statusFactory.validate({
      name: params.name,
      code: params.code,
      color: params.color,
      order: params.order,
    });

    const existingStatus = await this.statusRepository.findById(params.id);

    const status = await this.transactionManager.run(async () => {
      if (params.isDefault) {
        await this.statusRepository.clearDefault(
          existingStatus.projectId,
          existingStatus.id,
        );
      }

      return await this.statusRepository.update({
        id: params.id,
        name: params.name?.trim(),
        code: params.code,
        color: params.color,
        order: params.order,
        isDefault: params.isDefault,
        version: params.version,
      });
    });

    this.socket.emitToRoom(
      `project:${status.projectId}`,
      'status:updated',
      status,
    );

    return status;
  }
}
