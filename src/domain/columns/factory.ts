import { Injectable } from '@nestjs/common';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { Column } from './entity';
import { ColumnException } from './exception';

export interface ColumnStruct {
  id: string;
  boardId: string;
  name: string;
  order: number;
  status: BoardStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ColumnFactory {
  create(data: Omit<ColumnStruct, 'id' | 'createdAt' | 'updatedAt' | 'version'>): ColumnStruct;
}

@Injectable()
export class ColumnFactoryImpl implements ColumnFactory {
  create(data: Omit<ColumnStruct, 'id' | 'createdAt' | 'updatedAt' | 'version'>): ColumnStruct {
    if (!data.name || data.name.trim().length === 0) {
      throw ColumnException.InvalidName();
    }

    if (data.order < 0) {
      throw ColumnException.InvalidOrder();
    }

    return {
      ...data,
      id: '',
      version: 1,
      createdAt: new Date(),
      updatedAt: null,
    };
  }
}
