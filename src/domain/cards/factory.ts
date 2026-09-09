import { CardStatus } from 'src/infrastructure/common/enum';
import { Card } from './entity';
import { CardException } from './exception';

export interface CardStruct {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  order: number;
  status: CardStatus;
  assigneeId?: string | null;
  assignerId?: string | null;
  points?: number;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CardFactory {
  create(data: Omit<CardStruct, 'id' | 'createdAt' | 'updatedAt' | 'version'>): CardStruct;
}

export class CardFactoryImpl implements CardFactory {
  create(data: Omit<CardStruct, 'id' | 'createdAt' | 'updatedAt' | 'version'>): CardStruct {
    if (!data.title || data.title.trim().length === 0) {
      throw CardException.InvalidTitle();
    }

    if (data.order < 0) {
      throw CardException.InvalidOrder();
    }

    if (data.points !== undefined && data.points < 0) {
      throw CardException.InvalidPoints();
    }

    return {
      ...data,
      assigneeId: data.assigneeId ?? null,
      assignerId: data.assignerId ?? null,
      points: data.points ?? 0,
      id: '',
      version: 1,
      createdAt: new Date(),
      updatedAt: null,
    };
  }
}
