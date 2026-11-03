import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { CardDocument } from 'src/infrastructure/database/mongodb/models';
import { CardMapper } from 'src/infrastructure/database/mongodb/mappers';
import { Card } from './entity';
import { CardStruct } from './factory';
import { CardException } from './exception';

export type CardCreateParams = Omit<
  CardStruct,
  'id' | 'createdAt' | 'updatedAt' | 'version'
>;

export type CardUpdateParams = Partial<Omit<CardStruct, 'createdAt'>> & {
  /** When set, the update fails if the card's stored status differs (checked inside the write). */
  expectedStatusId?: string;
};

export interface CardGetQuery {
  page?: number;
  limit?: number;
  columnId: string;
  title?: string;
  statusId?: string;
}

export interface CardGetResponse {
  data: Card[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface CardReorderParams {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
  statusId?: string;
  /** When set, the move fails if the card's stored status differs (checked inside the write). */
  expectedStatusId?: string;
}

export interface CardRepository {
  create(card: CardCreateParams): Promise<Card>;
  find(params: CardGetQuery): Promise<CardGetResponse>;
  findById(id: string): Promise<Card>;
  update(card: CardUpdateParams & { id: string }): Promise<Card>;
  reorder(params: CardReorderParams): Promise<Card>;
  /** Counts cards using a status, optionally limited to one column. */
  countByStatusId(statusId: string, columnId?: string): Promise<number>;
  delete(id: string): Promise<string>;
}

export class CardRepositoryImpl implements CardRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(card: CardCreateParams): Promise<Card> {
    const column = await this.database
      .columnModel()
      .findById(card.columnId)
      .exec();

    if (!column) {
      throw CardException.InvalidColumnId(card.columnId);
    }

    if (card.assigneeId) {
      const assignee = await this.database
        .userModel()
        .findById(card.assigneeId)
        .exec();
      if (!assignee) {
        throw new CardException(
          `User with ID ${card.assigneeId} not found.`,
          404,
        );
      }
    }

    if (card.assignerId) {
      const assigner = await this.database
        .userModel()
        .findById(card.assignerId)
        .exec();
      if (!assigner) {
        throw new CardException(
          `User with ID ${card.assignerId} not found.`,
          404,
        );
      }
    }

    if (card.points !== undefined && card.points < 0) {
      throw CardException.InvalidPoints();
    }

    const duplicate = await this.cardModel
      .findOne({
        columnId: new Types.ObjectId(card.columnId),
        title: card.title,
      })
      .exec();

    if (duplicate) {
      throw CardException.CardAlreadyExists(card.title, card.columnId);
    }

    const cardData = await this.cardModel.create({
      ...card,
      columnId: new Types.ObjectId(card.columnId),
      statusId: new Types.ObjectId(card.statusId),
      assigneeId: card.assigneeId ? new Types.ObjectId(card.assigneeId) : null,
      assignerId: card.assignerId ? new Types.ObjectId(card.assignerId) : null,
      points: card.points ?? 0,
    });

    return CardMapper.toDomain(cardData);
  }

  async find(params: CardGetQuery): Promise<CardGetResponse> {
    const { page = 1, limit = 10, columnId, title, statusId } = params;

    const filter: Record<string, any> = {
      columnId: new Types.ObjectId(columnId),
    };

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (statusId) {
      filter.statusId = new Types.ObjectId(statusId);
    }

    const totalCount = await this.cardModel.countDocuments(filter);

    const cardDataList = await this.cardModel
      .find(filter)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: cardDataList.map((item) => CardMapper.toDomain(item)),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Card> {
    const cardData = await this.cardModel.findById(id).exec();

    if (!cardData) {
      throw CardException.CardNotFound(id);
    }

    return CardMapper.toDomain(cardData);
  }

  async update(card: CardUpdateParams & { id: string }): Promise<Card> {
    const existingCard = await this.cardModel.findById(card.id).exec();

    if (!existingCard) {
      throw CardException.CardNotFound(card.id);
    }

    if (
      card.expectedStatusId &&
      existingCard.statusId.toString() !== card.expectedStatusId
    ) {
      throw CardException.CurrentStatusMismatch(
        card.id,
        card.expectedStatusId,
      );
    }

    if (card.columnId) {
      const column = await this.database
        .columnModel()
        .findById(card.columnId)
        .exec();
      if (!column) {
        throw CardException.InvalidColumnId(card.columnId);
      }
      existingCard.columnId = new Types.ObjectId(card.columnId);
    }

    if (card.title) {
      const duplicate = await this.cardModel
        .findOne({
          columnId: existingCard.columnId,
          title: card.title,
          _id: { $ne: existingCard._id },
        })
        .exec();

      if (duplicate) {
        throw CardException.CardAlreadyExists(
          card.title,
          existingCard.columnId.toString(),
        );
      }

      existingCard.title = card.title;
    }

    if (card.description !== undefined)
      existingCard.description = card.description;
    if (card.order !== undefined) existingCard.order = card.order;
    if (card.statusId)
      existingCard.statusId = new Types.ObjectId(card.statusId);
    if (card.assigneeId !== undefined) {
      if (card.assigneeId) {
        const assignee = await this.database
          .userModel()
          .findById(card.assigneeId)
          .exec();
        if (!assignee) {
          throw new CardException(
            `User with ID ${card.assigneeId} not found.`,
            404,
          );
        }
        existingCard.assigneeId = new Types.ObjectId(card.assigneeId);
      } else {
        existingCard.assigneeId = null;
      }
    }
    if (card.assignerId !== undefined) {
      if (card.assignerId) {
        const assigner = await this.database
          .userModel()
          .findById(card.assignerId)
          .exec();
        if (!assigner) {
          throw new CardException(
            `User with ID ${card.assignerId} not found.`,
            404,
          );
        }
        existingCard.assignerId = new Types.ObjectId(card.assignerId);
      } else {
        existingCard.assignerId = null;
      }
    }
    if (card.points !== undefined) {
      if (card.points < 0) {
        throw CardException.InvalidPoints();
      }
      existingCard.points = card.points;
    }
    if (card.version) existingCard.version = card.version;
    existingCard.updatedAt = new Date();

    await existingCard.save();

    return CardMapper.toDomain(existingCard);
  }

  async reorder(params: CardReorderParams): Promise<Card> {
    const { cardId, sourceColumnId, targetColumnId, newIndex, statusId } =
      params;

    const existingCard = await this.cardModel.findById(cardId).exec();

    if (!existingCard) {
      throw CardException.CardNotFound(cardId);
    }

    if (
      params.expectedStatusId &&
      existingCard.statusId.toString() !== params.expectedStatusId
    ) {
      throw CardException.CurrentStatusMismatch(
        cardId,
        params.expectedStatusId,
      );
    }

    if (existingCard.columnId.toString() !== sourceColumnId) {
      throw new CardException(
        `Card ${cardId} is not in source column ${sourceColumnId}.`,
        400,
      );
    }

    const targetColumn = await this.database
      .columnModel()
      .findById(targetColumnId)
      .exec();

    if (!targetColumn) {
      throw CardException.InvalidColumnId(targetColumnId);
    }

    const sourceCards = await this.cardModel
      .find({ columnId: new Types.ObjectId(sourceColumnId) })
      .sort({ order: 1 })
      .exec();

    const sourceList = sourceCards.filter(
      (item) => item._id.toString() !== cardId,
    );

    if (sourceColumnId === targetColumnId) {
      const reorderedList = [...sourceList];
      reorderedList.splice(newIndex, 0, existingCard);

      reorderedList.forEach((item, index) => {
        item.order = index;
        item.updatedAt = new Date();
      });

      if (statusId) {
        existingCard.statusId = new Types.ObjectId(statusId);
      }

      await this.saveSequentially(reorderedList);
      return CardMapper.toDomain(existingCard);
    }

    const targetCards = await this.cardModel
      .find({ columnId: new Types.ObjectId(targetColumnId) })
      .sort({ order: 1 })
      .exec();

    const targetList = targetCards.filter(
      (item) => item._id.toString() !== cardId,
    );
    const insertionIndex = Math.min(Math.max(newIndex, 0), targetList.length);

    targetList.splice(insertionIndex, 0, existingCard);
    existingCard.columnId = new Types.ObjectId(targetColumnId);
    if (statusId) existingCard.statusId = new Types.ObjectId(statusId);
    existingCard.updatedAt = new Date();

    sourceList.forEach((item, index) => {
      item.order = index;
      item.updatedAt = new Date();
    });

    targetList.forEach((item, index) => {
      item.order = index;
      item.updatedAt = new Date();
    });

    await this.saveSequentially([...sourceList, ...targetList]);

    return CardMapper.toDomain(existingCard);
  }

  async countByStatusId(statusId: string, columnId?: string): Promise<number> {
    const filter: Record<string, any> = {
      statusId: new Types.ObjectId(statusId),
    };

    if (columnId) {
      filter.columnId = new Types.ObjectId(columnId);
    }

    return await this.cardModel.countDocuments(filter);
  }

  async delete(id: string): Promise<string> {
    const card = await this.cardModel.findById(id).exec();

    if (!card) {
      throw CardException.CardNotFound(id);
    }

    await this.cardModel.findByIdAndDelete(id).exec();
    return id;
  }

  // A MongoDB session does not support concurrent operations, so saves made
  // inside a transaction must not run in parallel.
  private async saveSequentially(cards: CardDocument[]): Promise<void> {
    for (const item of cards) {
      await item.save();
    }
  }

  private get cardModel(): Model<CardDocument> {
    return this.database.cardModel();
  }
}
