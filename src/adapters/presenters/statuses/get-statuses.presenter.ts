import { Status, StatusStruct } from 'src/domain';

export interface GetStatusesPresenter {
  present(statuses: Status[]): StatusStruct[];
}

export class GetStatusesPresenterImpl implements GetStatusesPresenter {
  present(statuses: Status[]): StatusStruct[] {
    return statuses.map((status) => ({
      id: status.id,
      projectId: status.projectId,
      name: status.name,
      code: status.code,
      color: status.color,
      order: status.order,
      isDefault: status.isDefault,
      isDone: status.isDone,
      version: status.version,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
    }));
  }
}
