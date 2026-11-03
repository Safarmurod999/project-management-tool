import { Module } from '@nestjs/common';
import {
  CardController,
  CreateCardPresenterImpl,
  FindCardByIdPresenterImpl,
  GetCardsPresenterImpl,
  UpdateCardPresenterImpl,
  DeleteCardPresenterImpl,
} from 'src/adapters';
import {
  CreateCardUsecaseImpl,
  FindCardByIdUsecaseImpl,
  GetCardsUsecaseImpl,
  UpdateCardUsecaseImpl,
  ReorderCardUsecaseImpl,
  TransitionCardUsecaseImpl,
  DeleteCardUsecaseImpl,
} from 'src/application';
import { CardFactoryImpl, CardRepositoryImpl } from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { StatusesModule } from '../statuses/statuses.module';
import { ColumnsModule } from '../columns/columns.module';
import { BoardsModule } from '../boards/boards.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [StatusesModule, ColumnsModule, BoardsModule, WorkflowsModule],
  controllers: [CardController],
  providers: [
    {
      provide: FactorySymbols.CardFactory,
      useClass: CardFactoryImpl,
    },
    {
      provide: RepositorySymbols.CardRepository,
      useClass: CardRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Card.CreateCardUsecase,
      useClass: CreateCardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Card.FindCardByIdUsecase,
      useClass: FindCardByIdUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Card.GetCardsUsecase,
      useClass: GetCardsUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Card.UpdateCardUsecase,
      useClass: UpdateCardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Card.ReorderCardUsecase,
      useClass: ReorderCardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Card.TransitionCardUsecase,
      useClass: TransitionCardUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Card.DeleteCardUsecase,
      useClass: DeleteCardUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Card.CreateCardPresenter,
      useClass: CreateCardPresenterImpl,
    },
    {
      provide: PresenterSymbols.Card.FindCardByIdPresenter,
      useClass: FindCardByIdPresenterImpl,
    },
    {
      provide: PresenterSymbols.Card.GetCardsPresenter,
      useClass: GetCardsPresenterImpl,
    },
    {
      provide: PresenterSymbols.Card.UpdateCardPresenter,
      useClass: UpdateCardPresenterImpl,
    },
    {
      provide: PresenterSymbols.Card.DeleteCardPresenter,
      useClass: DeleteCardPresenterImpl,
    },
  ],
  exports: [FactorySymbols.CardFactory, RepositorySymbols.CardRepository],
})
export class CardsModule {}
