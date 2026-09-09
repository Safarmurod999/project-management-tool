import { Column, ColumnStruct } from 'src/domain';

export interface GetColumnsPresenter {
  present(columns: Column[]): ColumnStruct[];
}

export class GetColumnsPresenterImpl implements GetColumnsPresenter {
  present(columns: Column[]): ColumnStruct[] {
    return columns.map((column) => ({
      id: column.id,
      boardId: column.boardId,
      name: column.name,
      order: column.order,
      status: column.status,
      version: column.version,
      createdAt: column.createdAt,
      updatedAt: column.updatedAt,
    }));
  }
}
