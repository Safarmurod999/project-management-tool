import { WorkflowStatus } from 'src/domain/workflow-statuses';
import { WorkflowStatusDocument } from '../models';

export class WorkflowStatusMapper {
  static toDomain(data: WorkflowStatusDocument): WorkflowStatus {
    return new WorkflowStatus(
      data._id.toString(),
      data.workflowId.toString(),
      data.statusId.toString(),
      data.createdAt,
      data.updatedAt,
    );
  }
}
