import { Module } from '@nestjs/common';
import { BoardController, CreateBoardPresenterImpl } from 'src/adapters';
import { CreateBoardUsecaseImpl } from 'src/application';
import { BoardFactoryImpl, BoardRepositoryImpl } from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';

@Module({
  imports: [],
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
      provide: PresenterSymbols.Board.CreateBoardPresenter,
      useClass: CreateBoardPresenterImpl,
    },
  ],
  exports: [FactorySymbols.BoardFactory, RepositorySymbols.BoardRepository],
})
export class BoardsModule {}
