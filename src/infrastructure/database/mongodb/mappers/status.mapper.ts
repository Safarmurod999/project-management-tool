import { Status } from 'src/domain/statuses';
import { StatusDocument } from '../models';

export class StatusMapper {
  static toDomain(data: StatusDocument): Status {
    return new Status(
      data._id.toString(),
      data.projectId.toString(),
      data.name,
      data.code,
      data.color,
      data.order,
      data.isDefault,
      data.version,
      data.createdAt,
      data.updatedAt,
    );
  }
}
