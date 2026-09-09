import { Card } from 'src/domain/cards';
import { CardDocument } from '../models';

export class CardMapper {
  static toDomain(data: CardDocument): Card {
    return new Card(
      data._id.toString(),
      data.columnId.toString(),
      data.title,
      data.description,
      data.order,
      data.status,
      data.assigneeId?.toString() ?? null,
      data.assignerId?.toString() ?? null,
      data.points ?? 0,
      data.version,
      data.createdAt,
      data.updatedAt,
    );
  }
}
