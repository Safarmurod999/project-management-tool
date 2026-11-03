export interface DeleteWorkflowPresenter {
  present(id: string): { id: string };
}

export class DeleteWorkflowPresenterImpl implements DeleteWorkflowPresenter {
  present(id: string): { id: string } {
    return { id };
  }
}
