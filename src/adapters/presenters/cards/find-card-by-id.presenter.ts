import { Card, CardStruct } from 'src/domain';

export interface FindCardByIdPresenter {
  present(card: Card): CardStruct;
}

export class FindCardByIdPresenterImpl implements FindCardByIdPresenter {
  present(card: Card): CardStruct {
    return {
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
    };
  }
}
