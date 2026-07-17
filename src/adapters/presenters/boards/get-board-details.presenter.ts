import { Board, BoardStruct, Project, ProjectStruct } from 'src/domain';

export interface GetBoardDetailsPresenter {
  present(data: { board: Board; project: Project }): {
    board: BoardStruct;
    project: ProjectStruct;
  };
}

export class GetBoardDetailsPresenterImpl implements GetBoardDetailsPresenter {
  present(data: { board: Board; project: Project }): {
    board: BoardStruct;
    project: ProjectStruct;
  } {
    return {
      board: {
        id: data.board.id,
        projectId: data.board.projectId,
        name: data.board.name,
        description: data.board.description,
        status: data.board.status,
        version: data.board.version,
        createdAt: data.board.createdAt,
        updatedAt: data.board.updatedAt,
      },
      project: {
        id: data.project.id,
        name: data.project.name,
        description: data.project.description,
        teamId: data.project.teamId,
        createdAt: data.project.createdAt,
        updatedAt: data.project.updatedAt,
        status: data.project.status,
      },
    };
  }
}
