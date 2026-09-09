export interface DeleteCardPresenter {
  present(id: string): { id: string };
}

export class DeleteCardPresenterImpl implements DeleteCardPresenter {
  present(id: string): { id: string } {
    return { id };
  }
}
