import { Module } from '@nestjs/common';
import {
  BoardController,
  CreateBoardPresenterImpl,
  FindBoardByIdPresenterImpl,
  GetBoardsPresenterImpl,
  UpdateBoardPresenterImpl,
  GetBoardDetailsPresenterImpl,
} from 'src/adapters';
import {
  CreateBoardUsecaseImpl,
  FindBoardByIdUsecaseImpl,
  GetBoardsUsecaseImpl,
  UpdateBoardUsecaseImpl,
  DeleteBoardUsecaseImpl,
  GetBoardDetailsUsecaseImpl,
} from 'src/application';
import { BoardFactoryImpl, BoardRepositoryImpl } from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';

import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [BoardController],
  providers: [
    {
      provide: FactorySymbols.BoardFactory,
      useClass: BoardFactoryImpl,
    },
    {
      provide: RepositorySymbols.BoardRepository,
      useClass: BoardRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Board.CreateBoardUsecase,
      useClass: CreateBoardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Board.FindBoardByIdUsecase,
      useClass: FindBoardByIdUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Board.GetBoardsUsecase,
      useClass: GetBoardsUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Board.UpdateBoardUsecase,
      useClass: UpdateBoardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Board.DeleteBoardUsecase,
      useClass: DeleteBoardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Board.GetBoardDetailsUsecase,
      useClass: GetBoardDetailsUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Board.CreateBoardPresenter,
      useClass: CreateBoardPresenterImpl,
    },
    {
      provide: PresenterSymbols.Board.FindBoardByIdPresenter,
      useClass: FindBoardByIdPresenterImpl,
    },
    {
      provide: PresenterSymbols.Board.GetBoardsPresenter,
      useClass: GetBoardsPresenterImpl,
    },
    {
      provide: PresenterSymbols.Board.UpdateBoardPresenter,
      useClass: UpdateBoardPresenterImpl,
    },
    {
      provide: PresenterSymbols.Board.GetBoardDetailsPresenter,
      useClass: GetBoardDetailsPresenterImpl,
    },
  ],
  exports: [FactorySymbols.BoardFactory, RepositorySymbols.BoardRepository],
})
export class BoardsModule {}
