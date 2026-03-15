import { Module } from '@nestjs/common';
import { BoardFactoryImpl, BoardRepositoryImpl } from 'src/domain';
import {
  FactorySymbols,
  RepositorySymbols,
} from 'src/infrastructure/dependency-injection';

@Module({
  providers: [
    {
      provide: FactorySymbols.BoardFactory,
      useClass: BoardFactoryImpl,
    },
    {
      provide: RepositorySymbols.BoardRepository,
      useClass: BoardRepositoryImpl,
    },
  ],
  exports: [
    FactorySymbols.BoardFactory,
    RepositorySymbols.BoardRepository,
  ],
})
export class BoardsModule {}