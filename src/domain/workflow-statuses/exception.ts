export class WorkflowStatusException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'WorkflowStatusException';
    this.statusCode = statusCode;
  }

  static InvalidWorkflowId(workflowId: string): WorkflowStatusException {
    return new WorkflowStatusException(
      `Workflow with ID ${workflowId} not found.`,
      404,
    );
  }

  static InvalidStatusId(statusId: string): WorkflowStatusException {
    return new WorkflowStatusException(
      `Status with ID ${statusId} not found.`,
      404,
    );
  }

  static ProjectMismatch(
    statusId: string,
    workflowId: string,
  ): WorkflowStatusException {
    return new WorkflowStatusException(
      `Status ${statusId} does not belong to the project of workflow ${workflowId}.`,
      400,
    );
  }

  static StatusAlreadyInWorkflow(
    statusId: string,
    workflowId: string,
  ): WorkflowStatusException {
    return new WorkflowStatusException(
      `Status ${statusId} is already part of workflow ${workflowId}.`,
      409,
    );
  }

  static StatusNotInWorkflow(
    statusId: string,
    workflowId: string,
  ): WorkflowStatusException {
    return new WorkflowStatusException(
      `Status ${statusId} is not part of workflow ${workflowId}.`,
      404,
    );
  }

  static StatusHasTransitions(
    statusId: string,
    workflowId: string,
  ): WorkflowStatusException {
    return new WorkflowStatusException(
      `Status ${statusId} is used by transitions of workflow ${workflowId}. Remove those transitions first.`,
      409,
    );
  }
}
