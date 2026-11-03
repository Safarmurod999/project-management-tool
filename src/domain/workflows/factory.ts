import { Injectable } from '@nestjs/common';
import { WorkflowException } from './exception';

export interface WorkflowStruct {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export type WorkflowFactoryParams = Pick<WorkflowStruct, 'projectId' | 'name'> &
  Partial<Pick<WorkflowStruct, 'description' | 'isDefault'>>;

export type WorkflowValidationParams = Partial<Pick<WorkflowStruct, 'name'>>;

export interface WorkflowFactory {
  create(data: WorkflowFactoryParams): WorkflowStruct;
  /** Validates only the fields that are present; used for partial updates. */
  validate(data: WorkflowValidationParams): void;
}

@Injectable()
export class WorkflowFactoryImpl implements WorkflowFactory {
  create(data: WorkflowFactoryParams): WorkflowStruct {
    if (!data.name) {
      throw WorkflowException.InvalidName();
    }

    this.validate({ name: data.name });

    return {
      projectId: data.projectId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      isDefault: data.isDefault ?? false,
      id: '',
      version: 1,
      createdAt: new Date(),
      updatedAt: null,
    };
  }

  validate(data: WorkflowValidationParams): void {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw WorkflowException.InvalidName();
    }
  }
}
