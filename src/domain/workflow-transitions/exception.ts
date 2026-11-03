export class WorkflowTransitionException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'WorkflowTransitionException';
    this.statusCode = statusCode;
  }

  static TransitionNotFound(id: string): WorkflowTransitionException {
    return new WorkflowTransitionException(
      `Workflow transition with ID ${id} not found.`,
      404,
    );
  }

  static InvalidWorkflowId(workflowId: string): WorkflowTransitionException {
    return new WorkflowTransitionException(
      `Workflow with ID ${workflowId} not found.`,
      404,
    );
  }

  static InvalidStatusId(): WorkflowTransitionException {
    return new WorkflowTransitionException(
      'Transition requires both fromStatusId and toStatusId.',
      400,
    );
  }

  static SelfTransition(statusId: string): WorkflowTransitionException {
    return new WorkflowTransitionException(
      `A transition cannot start and end at the same status (${statusId}).`,
      400,
    );
  }

  static StatusNotInWorkflow(
    statusId: string,
    workflowId: string,
  ): WorkflowTransitionException {
    return new WorkflowTransitionException(
      `Status ${statusId} is not part of workflow ${workflowId}.`,
      400,
    );
  }

  static TransitionAlreadyExists(
    fromStatusId: string,
    toStatusId: string,
    workflowId: string,
  ): WorkflowTransitionException {
    return new WorkflowTransitionException(
      `Transition from ${fromStatusId} to ${toStatusId} already exists in workflow ${workflowId}.`,
      409,
    );
  }

  static TransitionNotAllowed(
    fromStatusId: string,
    toStatusId: string,
  ): WorkflowTransitionException {
    return new WorkflowTransitionException(
      `Moving a card from status ${fromStatusId} to ${toStatusId} is not allowed by its workflow.`,
      409,
    );
  }
}
