import { Workflow } from 'src/domain/workflows';
import { WorkflowDocument } from '../models';

export class WorkflowMapper {
  static toDomain(data: WorkflowDocument): Workflow {
    return new Workflow(
      data._id.toString(),
      data.projectId.toString(),
      data.name,
      data.description ?? null,
      data.isDefault,
      data.version,
      data.createdAt,
      data.updatedAt,
    );
  }
}
