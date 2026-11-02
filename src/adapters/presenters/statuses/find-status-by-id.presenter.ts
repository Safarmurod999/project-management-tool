import { Status, StatusStruct } from 'src/domain';

export interface FindStatusByIdPresenter {
  present(status: Status): StatusStruct;
}

export class FindStatusByIdPresenterImpl implements FindStatusByIdPresenter {
  present(status: Status): StatusStruct {
    return {
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
    };
  }
}
