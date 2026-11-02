import { Module } from '@nestjs/common';
import {
  StatusController,
  CreateStatusPresenterImpl,
  FindStatusByIdPresenterImpl,
  GetStatusesPresenterImpl,
  UpdateStatusPresenterImpl,
  DeleteStatusPresenterImpl,
} from 'src/adapters';
import {
  CreateStatusUsecaseImpl,
  FindStatusByIdUsecaseImpl,
  GetStatusesUsecaseImpl,
  UpdateStatusUsecaseImpl,
  DeleteStatusUsecaseImpl,
} from 'src/application';
import {
  CardRepositoryImpl,
  ColumnStatusRepositoryImpl,
  StatusFactoryImpl,
  StatusRepositoryImpl,
} from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';

/**
 * Owns project statuses and their column mappings (ColumnStatus). It imports
 * no feature modules so Projects, Boards, Columns and Cards can all depend on it
 * without circular imports.
 */
@Module({
  controllers: [StatusController],
  providers: [
    {
      provide: FactorySymbols.StatusFactory,
      useClass: StatusFactoryImpl,
    },
    {
      provide: RepositorySymbols.StatusRepository,
      useClass: StatusRepositoryImpl,
    },
    {
      provide: RepositorySymbols.ColumnStatusRepository,
      useClass: ColumnStatusRepositoryImpl,
    },
    {
      provide: RepositorySymbols.CardRepository,
      useClass: CardRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Status.CreateStatusUsecase,
      useClass: CreateStatusUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Status.FindStatusByIdUsecase,
      useClass: FindStatusByIdUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Status.GetStatusesUsecase,
      useClass: GetStatusesUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Status.UpdateStatusUsecase,
      useClass: UpdateStatusUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Status.DeleteStatusUsecase,
      useClass: DeleteStatusUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Status.CreateStatusPresenter,
      useClass: CreateStatusPresenterImpl,
    },
    {
      provide: PresenterSymbols.Status.FindStatusByIdPresenter,
      useClass: FindStatusByIdPresenterImpl,
    },
    {
      provide: PresenterSymbols.Status.GetStatusesPresenter,
      useClass: GetStatusesPresenterImpl,
    },
    {
      provide: PresenterSymbols.Status.UpdateStatusPresenter,
      useClass: UpdateStatusPresenterImpl,
    },
    {
      provide: PresenterSymbols.Status.DeleteStatusPresenter,
      useClass: DeleteStatusPresenterImpl,
    },
  ],
  exports: [
    FactorySymbols.StatusFactory,
    RepositorySymbols.StatusRepository,
    RepositorySymbols.ColumnStatusRepository,
  ],
})
export class StatusesModule {}
