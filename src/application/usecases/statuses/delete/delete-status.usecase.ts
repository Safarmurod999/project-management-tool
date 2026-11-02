import { Inject } from '@nestjs/common';
import {
  CardRepository,
  ColumnStatusRepository,
  StatusException,
  StatusRepository,
} from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { DeleteStatusUsecase, DeleteStatusUsecaseParams } from './types';

export class DeleteStatusUsecaseImpl implements DeleteStatusUsecase {
  constructor(
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,

    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,

    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: DeleteStatusUsecaseParams): Promise<string> {
    const status = await this.statusRepository.findById(params.id);

    if (status.isDefault) {
      throw StatusException.CannotDeleteDefaultStatus(params.id);
    }

    // Every card must keep a valid status, so a status in use cannot be removed.
    if ((await this.cardRepository.countByStatusId(params.id)) > 0) {
      throw StatusException.StatusInUse(params.id);
    }

    const deletedId = await this.transactionManager.run(async () => {
      await this.columnStatusRepository.deleteByStatusId(params.id);
      return await this.statusRepository.delete(params.id);
    });

    this.socket.emitToRoom(`project:${status.projectId}`, 'status:deleted', {
      id: deletedId,
      projectId: status.projectId,
    });

    return deletedId;
  }
}
