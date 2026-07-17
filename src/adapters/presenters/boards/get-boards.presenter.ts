import { Board, BoardStruct } from 'src/domain';

export interface GetBoardsPresenter {
  present(boards: Board[]): BoardStruct[];
}

export class GetBoardsPresenterImpl implements GetBoardsPresenter {
  present(boards: Board[]): BoardStruct[] {
    return boards.map((board) => ({
      id: board.id,
      projectId: board.projectId,
      name: board.name,
      description: board.description,
      status: board.status,
      version: board.version,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    }));
  }
}
