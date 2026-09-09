export interface DeleteColumnPresenter {
  present(id: string): { id: string };
}

export class DeleteColumnPresenterImpl implements DeleteColumnPresenter {
  present(id: string): { id: string } {
    return { id };
  }
}
