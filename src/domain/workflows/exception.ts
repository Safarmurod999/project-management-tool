export class WorkflowException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'WorkflowException';
    this.statusCode = statusCode;
  }

  static WorkflowNotFound(id: string): WorkflowException {
    return new WorkflowException(`Workflow with ID ${id} not found.`, 404);
  }

  static InvalidName(): WorkflowException {
    return new WorkflowException('Workflow name is invalid.', 400);
  }

  static InvalidProjectId(projectId: string): WorkflowException {
    return new WorkflowException(
      `Project with ID ${projectId} not found.`,
      404,
    );
  }

  static WorkflowAlreadyExists(
    name: string,
    projectId: string,
  ): WorkflowException {
    return new WorkflowException(
      `Workflow with name "${name}" already exists in project ${projectId}.`,
      409,
    );
  }

  static CannotDeleteDefaultWorkflow(id: string): WorkflowException {
    return new WorkflowException(
      `Workflow with ID ${id} is the project default. Mark another workflow as default first.`,
      409,
    );
  }

  static ProjectHasNoWorkflow(projectId: string): WorkflowException {
    return new WorkflowException(
      `Project ${projectId} has no workflow. Create one first.`,
      404,
    );
  }

  static CannotUnsetDefault(id: string): WorkflowException {
    return new WorkflowException(
      `Workflow with ID ${id} is the project default. Mark another workflow as default instead.`,
      409,
    );
  }

  static StatusInUse(statusId: string, workflowId: string): WorkflowException {
    return new WorkflowException(
      `Status ${statusId} is used by cards governed by workflow ${workflowId}. Move them to another status first.`,
      409,
    );
  }

  static TransitionNotInWorkflow(
    transitionId: string,
    workflowId: string,
  ): WorkflowException {
    return new WorkflowException(
      `Transition ${transitionId} does not belong to workflow ${workflowId}.`,
      404,
    );
  }
}
