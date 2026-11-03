import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import {
  WorkflowDocument,
  WorkflowStatusDocument,
} from 'src/infrastructure/database/mongodb/models';
import { WorkflowStatusMapper } from 'src/infrastructure/database/mongodb/mappers';
import { WorkflowStatus } from './entity';
import { WorkflowStatusException } from './exception';

export interface WorkflowStatusCreateParams {
  workflowId: string;
  statusId: string;
}

export interface WorkflowStatusRepository {
  create(params: WorkflowStatusCreateParams): Promise<WorkflowStatus>;
  /** Adds several statuses to one workflow; fails without writing if any is invalid. */
  createMany(
    workflowId: string,
    statusIds: string[],
  ): Promise<WorkflowStatus[]>;
  findByWorkflowId(workflowId: string): Promise<WorkflowStatus[]>;
  findByStatusId(statusId: string): Promise<WorkflowStatus[]>;
  exists(workflowId: string, statusId: string): Promise<boolean>;
  /** Fails while transitions of the workflow still reference the status. */
  delete(workflowId: string, statusId: string): Promise<string>;
  deleteByWorkflowId(workflowId: string): Promise<number>;
  deleteByStatusId(statusId: string): Promise<number>;
}

export class WorkflowStatusRepositoryImpl implements WorkflowStatusRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(params: WorkflowStatusCreateParams): Promise<WorkflowStatus> {
    const [workflowStatus] = await this.createMany(params.workflowId, [
      params.statusId,
    ]);

    return workflowStatus;
  }

  async createMany(
    workflowId: string,
    statusIds: string[],
  ): Promise<WorkflowStatus[]> {
    if (statusIds.length === 0) {
      return [];
    }

    const workflow = await this.findWorkflowOrFail(workflowId);
    const uniqueStatusIds = [...new Set(statusIds)];

    if (uniqueStatusIds.length !== statusIds.length) {
      const duplicateId = statusIds.find(
        (id, index) => statusIds.indexOf(id) !== index,
      )!;
      throw WorkflowStatusException.StatusAlreadyInWorkflow(
        duplicateId,
        workflowId,
      );
    }

    const objectIds = uniqueStatusIds.map((id) => new Types.ObjectId(id));
    const statuses = await this.database
      .statusModel()
      .find({ _id: { $in: objectIds } })
      .exec();

    for (const statusId of uniqueStatusIds) {
      const status = statuses.find((item) => item._id.toString() === statusId);

      if (!status) {
        throw WorkflowStatusException.InvalidStatusId(statusId);
      }

      if (status.projectId.toString() !== workflow.projectId.toString()) {
        throw WorkflowStatusException.ProjectMismatch(statusId, workflowId);
      }
    }

    const existing = await this.workflowStatusModel
      .findOne({ workflowId: workflow._id, statusId: { $in: objectIds } })
      .exec();

    if (existing) {
      throw WorkflowStatusException.StatusAlreadyInWorkflow(
        existing.statusId.toString(),
        workflowId,
      );
    }

    const dataList = await this.workflowStatusModel.insertMany(
      objectIds.map((statusId) => ({ workflowId: workflow._id, statusId })),
    );

    return dataList.map((item) =>
      WorkflowStatusMapper.toDomain(item as unknown as WorkflowStatusDocument),
    );
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowStatus[]> {
    const dataList = await this.workflowStatusModel
      .find({ workflowId: new Types.ObjectId(workflowId) })
      .sort({ createdAt: 1 })
      .exec();

    return dataList.map((item) => WorkflowStatusMapper.toDomain(item));
  }

  async findByStatusId(statusId: string): Promise<WorkflowStatus[]> {
    const dataList = await this.workflowStatusModel
      .find({ statusId: new Types.ObjectId(statusId) })
      .exec();

    return dataList.map((item) => WorkflowStatusMapper.toDomain(item));
  }

  async exists(workflowId: string, statusId: string): Promise<boolean> {
    const count = await this.workflowStatusModel
      .countDocuments({
        workflowId: new Types.ObjectId(workflowId),
        statusId: new Types.ObjectId(statusId),
      })
      .exec();

    return count > 0;
  }

  async delete(workflowId: string, statusId: string): Promise<string> {
    const workflowObjectId = new Types.ObjectId(workflowId);
    const statusObjectId = new Types.ObjectId(statusId);

    const transition = await this.database
      .workflowTransitionModel()
      .findOne({
        workflowId: workflowObjectId,
        $or: [{ fromStatusId: statusObjectId }, { toStatusId: statusObjectId }],
      })
      .exec();

    if (transition) {
      throw WorkflowStatusException.StatusHasTransitions(statusId, workflowId);
    }

    const data = await this.workflowStatusModel
      .findOneAndDelete({
        workflowId: workflowObjectId,
        statusId: statusObjectId,
      })
      .exec();

    if (!data) {
      throw WorkflowStatusException.StatusNotInWorkflow(statusId, workflowId);
    }

    return data._id.toString();
  }

  async deleteByWorkflowId(workflowId: string): Promise<number> {
    const result = await this.workflowStatusModel
      .deleteMany({ workflowId: new Types.ObjectId(workflowId) })
      .exec();

    return result.deletedCount;
  }

  async deleteByStatusId(statusId: string): Promise<number> {
    const result = await this.workflowStatusModel
      .deleteMany({ statusId: new Types.ObjectId(statusId) })
      .exec();

    return result.deletedCount;
  }

  private async findWorkflowOrFail(
    workflowId: string,
  ): Promise<WorkflowDocument> {
    const workflow = await this.database
      .workflowModel()
      .findById(workflowId)
      .exec();

    if (!workflow) {
      throw WorkflowStatusException.InvalidWorkflowId(workflowId);
    }

    return workflow;
  }

  private get workflowStatusModel(): Model<WorkflowStatusDocument> {
    return this.database.workflowStatusModel();
  }
}
