import { WorkflowTransition } from 'src/domain/workflow-transitions';
import { WorkflowTransitionDocument } from '../models';

export class WorkflowTransitionMapper {
  static toDomain(data: WorkflowTransitionDocument): WorkflowTransition {
    return new WorkflowTransition(
      data._id.toString(),
      data.workflowId.toString(),
      data.fromStatusId.toString(),
      data.toStatusId.toString(),
      data.createdAt,
      data.updatedAt,
    );
  }
}
