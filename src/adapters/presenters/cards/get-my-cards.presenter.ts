import { AssignedCardDetails, CardStruct } from 'src/domain';

export interface MyCardResponse extends CardStruct {
  status: {
    id: string;
    name: string;
    code: string;
    color: string;
    isDone: boolean;
  } | null;
  column: { id: string; name: string };
  board: { id: string; name: string };
  project: { id: string; name: string };
  assigner: { id: string; name: string } | null;
}

export interface GetMyCardsPresenter {
  present(cards: AssignedCardDetails[]): MyCardResponse[];
}

export class GetMyCardsPresenterImpl implements GetMyCardsPresenter {
  present(cards: AssignedCardDetails[]): MyCardResponse[] {
    return cards.map(({ card, status, column, board, project, assigner }) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      order: card.order,
      columnId: card.columnId,
      statusId: card.statusId,
      assigneeId: card.assigneeId,
      assignerId: card.assignerId,
      points: card.points,
      version: card.version,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      status: status
        ? {
            id: status.id,
            name: status.name,
            code: status.code,
            color: status.color,
            isDone: status.isDone,
          }
        : null,
      column: { id: column.id, name: column.name },
      board: { id: board.id, name: board.name },
      project: { id: project.id, name: project.name },
      assigner: assigner ? { id: assigner.id, name: assigner.name } : null,
    }));
  }
}
