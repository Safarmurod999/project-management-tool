import { ColumnStatus } from 'src/domain/column-statuses';
import { ColumnStatusDocument } from '../models';

export class ColumnStatusMapper {
  static toDomain(data: ColumnStatusDocument): ColumnStatus {
    return new ColumnStatus(
      data._id.toString(),
      data.columnId.toString(),
      data.statusId.toString(),
      data.order,
      data.createdAt,
      data.updatedAt,
    );
  }
}
