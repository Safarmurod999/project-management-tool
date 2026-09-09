import { Card, CardStruct } from 'src/domain';

export interface GetCardsPresenter {
  present(cards: Card[]): CardStruct[];
}

export class GetCardsPresenterImpl implements GetCardsPresenter {
  present(cards: Card[]): CardStruct[] {
    return cards.map((card) => ({
      id: card.id,
      columnId: card.columnId,
      title: card.title,
      description: card.description,
      order: card.order,
      status: card.status,
      assigneeId: card.assigneeId,
      assignerId: card.assignerId,
      points: card.points,
      version: card.version,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));
  }
}
