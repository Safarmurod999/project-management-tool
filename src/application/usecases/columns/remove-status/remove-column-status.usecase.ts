import { Inject } from '@nestjs/common';
import {
  CardRepository,
  ColumnStatusException,
  ColumnStatusRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  RemoveColumnStatusUsecase,
  RemoveColumnStatusUsecaseParams,
} from './types';

export class RemoveColumnStatusUsecaseImpl
  implements RemoveColumnStatusUsecase
{
  constructor(
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: RemoveColumnStatusUsecaseParams): Promise<string> {
    const mapping = await this.columnStatusRepository.findOne(
      params.columnId,
      params.statusId,
    );

    if (!mapping) {
      throw ColumnStatusException.MappingNotFound(
        params.columnId,
        params.statusId,
      );
    }

    // Cards in this column would otherwise hold a status their column lacks.
    const cardsUsingStatus = await this.cardRepository.countByStatusId(
      params.statusId,
      params.columnId,
    );

    if (cardsUsingStatus > 0) {
      throw ColumnStatusException.StatusInUseByCards(
        params.columnId,
        params.statusId,
      );
    }

    return await this.columnStatusRepository.delete(
      params.columnId,
      params.statusId,
    );
  }
}
