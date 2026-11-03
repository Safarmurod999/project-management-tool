import { Injectable } from '@nestjs/common';
import { WorkflowTransitionException } from './exception';

export interface WorkflowTransitionStruct {
  id: string;
  workflowId: string;
  fromStatusId: string;
  toStatusId: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export type WorkflowTransitionFactoryParams = Pick<
  WorkflowTransitionStruct,
  'workflowId' | 'fromStatusId' | 'toStatusId'
>;

export interface WorkflowTransitionFactory {
  create(data: WorkflowTransitionFactoryParams): WorkflowTransitionStruct;
  /**
   * Builds the rules for one transition. A two-way transition becomes two
   * one-way rules: from -> to and to -> from.
   */
  createRules(
    data: WorkflowTransitionFactoryParams,
    bidirectional?: boolean,
  ): WorkflowTransitionStruct[];
}

@Injectable()
export class WorkflowTransitionFactoryImpl
  implements WorkflowTransitionFactory
{
  create(data: WorkflowTransitionFactoryParams): WorkflowTransitionStruct {
    if (!data.fromStatusId || !data.toStatusId) {
      throw WorkflowTransitionException.InvalidStatusId();
    }

    if (data.fromStatusId === data.toStatusId) {
      throw WorkflowTransitionException.SelfTransition(data.fromStatusId);
    }

    return {
      workflowId: data.workflowId,
      fromStatusId: data.fromStatusId,
      toStatusId: data.toStatusId,
      id: '',
      createdAt: new Date(),
      updatedAt: null,
    };
  }

  createRules(
    data: WorkflowTransitionFactoryParams,
    bidirectional = false,
  ): WorkflowTransitionStruct[] {
    const forward = this.create(data);

    if (!bidirectional) {
      return [forward];
    }

    return [
      forward,
      this.create({
        workflowId: data.workflowId,
        fromStatusId: data.toStatusId,
        toStatusId: data.fromStatusId,
      }),
    ];
  }
}
