import { StatusStruct } from 'src/domain';
import { ColumnStatusDetails } from 'src/application';

export interface ColumnStatusResponse {
  id: string;
  columnId: string;
  statusId: string;
  order: number;
  status: StatusStruct;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface GetColumnStatusesPresenter {
  present(items: ColumnStatusDetails[]): ColumnStatusResponse[];
  presentOne(item: ColumnStatusDetails): ColumnStatusResponse;
}

export class GetColumnStatusesPresenterImpl
  implements GetColumnStatusesPresenter
{
  present(items: ColumnStatusDetails[]): ColumnStatusResponse[] {
    return items.map((item) => this.presentOne(item));
  }

  presentOne({
    columnStatus,
    status,
  }: ColumnStatusDetails): ColumnStatusResponse {
    return {
      id: columnStatus.id,
      columnId: columnStatus.columnId,
      statusId: columnStatus.statusId,
      order: columnStatus.order,
      status: {
        id: status.id,
        projectId: status.projectId,
        name: status.name,
        code: status.code,
        color: status.color,
        order: status.order,
        isDefault: status.isDefault,
        version: status.version,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      },
      createdAt: columnStatus.createdAt,
      updatedAt: columnStatus.updatedAt,
    };
  }
}
