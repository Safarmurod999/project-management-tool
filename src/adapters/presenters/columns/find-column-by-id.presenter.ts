import { Column, ColumnStruct } from 'src/domain';

export interface FindColumnByIdPresenter {
  present(column: Column): ColumnStruct;
}

export class FindColumnByIdPresenterImpl implements FindColumnByIdPresenter {
  present(column: Column): ColumnStruct {
    return {
      id: column.id,
      boardId: column.boardId,
      name: column.name,
      order: column.order,
      status: column.status,
      version: column.version,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    };
  }
}
