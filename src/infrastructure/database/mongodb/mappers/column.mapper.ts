import { Column } from 'src/domain/columns';
import { ColumnDocument } from '../models';

export class ColumnMapper {
  static toDomain(data: ColumnDocument): Column {
    return new Column(
      data._id.toString(),
      data.boardId.toString(),
      data.name,
      data.order,
      data.status,
      data.version,
      data.createdAt,
      data.updatedAt,
    );
  }
}
