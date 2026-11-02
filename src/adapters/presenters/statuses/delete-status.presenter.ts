export interface DeleteStatusPresenter {
  present(id: string): { id: string };
}

export class DeleteStatusPresenterImpl implements DeleteStatusPresenter {
  present(id: string): { id: string } {
    return { id };
  }
}
