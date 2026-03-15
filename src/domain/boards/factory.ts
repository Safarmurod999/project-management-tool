import { Board } from './entity';
import { BoardStatus } from 'src/infrastructure/common/enum';

export interface BoardStruct {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  status: BoardStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface BoardFactory {
  create(data: BoardStruct): Board;
}

export class BoardFactoryImpl implements BoardFactory {
  create(data: BoardStruct): Board {
    return new Board(
      data.id,
      data.projectId,
      data.name,
      data.description,
      data.status,
      data.version,
      data.createdAt,
      data.updatedAt,
    );
  }
}