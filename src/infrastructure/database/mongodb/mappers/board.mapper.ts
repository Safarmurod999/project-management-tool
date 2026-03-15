import { Board } from 'src/domain';
import { BoardDocument } from '../models';

export class BoardMapper {
  static toDomain(raw: BoardDocument): Board {
    return new Board(
      raw._id.toString(),
      raw.projectId.toString(),
      raw.name,
      raw.description,
      raw.status,
      raw.version,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(board: Board): any {
    return {
      projectId: board.projectId,
      name: board.name,
      description: board.description,
      status: board.status,
      version: board.version,
      updatedAt: board.updatedAt,
    };
  }
}