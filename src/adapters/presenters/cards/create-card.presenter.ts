import { Card, CardStruct } from 'src/domain';

export interface CreateCardPresenter {
  present(card: Card): CardStruct;
}

export class CreateCardPresenterImpl implements CreateCardPresenter {
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
