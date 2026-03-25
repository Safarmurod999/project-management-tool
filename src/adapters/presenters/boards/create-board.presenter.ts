import { Board, BoardStruct } from 'src/domain';

export interface CreateBoardPresenter {
  present(board: Board): BoardStruct;
}

export class CreateBoardPresenterImpl implements CreateBoardPresenter {
  present(board: Board): BoardStruct {
    return {
      id: board.id,
      projectId: board.projectId,
      name: board.name,
      description: board.description,
      status: board.status,
      version: board.version,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    };
  }
}
