import { Module } from '@nestjs/common';
import {
  ColumnController,
  CreateColumnPresenterImpl,
  FindColumnByIdPresenterImpl,
  GetColumnsPresenterImpl,
  UpdateColumnPresenterImpl,
  DeleteColumnPresenterImpl,
} from 'src/adapters';
import {
  CreateColumnUsecaseImpl,
  FindColumnByIdUsecaseImpl,
  GetColumnsUsecaseImpl,
  UpdateColumnUsecaseImpl,
  DeleteColumnUsecaseImpl,
} from 'src/application';
import { ColumnFactoryImpl, ColumnRepositoryImpl } from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';

@Module({
  controllers: [ColumnController],
  providers: [
    {
      provide: FactorySymbols.ColumnFactory,
      useClass: ColumnFactoryImpl,
    },
    {
      provide: RepositorySymbols.ColumnRepository,
      useClass: ColumnRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Column.CreateColumnUsecase,
      useClass: CreateColumnUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Column.FindColumnByIdUsecase,
      useClass: FindColumnByIdUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Column.GetColumnsUsecase,
      useClass: GetColumnsUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Column.UpdateColumnUsecase,
      useClass: UpdateColumnUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Column.DeleteColumnUsecase,
      useClass: DeleteColumnUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Column.CreateColumnPresenter,
      useClass: CreateColumnPresenterImpl,
    },
    {
      provide: PresenterSymbols.Column.FindColumnByIdPresenter,
      useClass: FindColumnByIdPresenterImpl,
    },
    {
      provide: PresenterSymbols.Column.GetColumnsPresenter,
      useClass: GetColumnsPresenterImpl,
    },
    {
      provide: PresenterSymbols.Column.UpdateColumnPresenter,
      useClass: UpdateColumnPresenterImpl,
    },
    {
      provide: PresenterSymbols.Column.DeleteColumnPresenter,
      useClass: DeleteColumnPresenterImpl,
    },
  ],
  exports: [FactorySymbols.ColumnFactory, RepositorySymbols.ColumnRepository],
})
export class ColumnsModule {}
