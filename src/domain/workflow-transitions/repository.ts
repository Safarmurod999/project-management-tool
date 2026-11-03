import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { WorkflowTransitionDocument } from 'src/infrastructure/database/mongodb/models';
import { WorkflowTransitionMapper } from 'src/infrastructure/database/mongodb/mappers';
import { WorkflowTransition } from './entity';
import { WorkflowTransitionStruct } from './factory';
import { WorkflowTransitionException } from './exception';

export type WorkflowTransitionCreateParams = Pick<
  WorkflowTransitionStruct,
  'workflowId' | 'fromStatusId' | 'toStatusId'
>;

export type WorkflowTransitionUpdateParams = Partial<
  Pick<WorkflowTransitionStruct, 'fromStatusId' | 'toStatusId'>
>;

export interface WorkflowTransitionRepository {
  create(params: WorkflowTransitionCreateParams): Promise<WorkflowTransition>;
  /** Creates several rules at once (e.g. both directions); fails without writing if any is invalid. */
  createMany(
    params: WorkflowTransitionCreateParams[],
  ): Promise<WorkflowTransition[]>;
  findById(id: string): Promise<WorkflowTransition>;
  findByWorkflowId(workflowId: string): Promise<WorkflowTransition[]>;
  /** Rules leaving `fromStatusId`, i.e. the statuses a card can move to. */
  findFrom(
    workflowId: string,
    fromStatusId: string,
  ): Promise<WorkflowTransition[]>;
  findOne(
    workflowId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<WorkflowTransition | null>;
  exists(
    workflowId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<boolean>;
  /** Changes the ends of a rule; validated like a new rule. */
  update(
    params: WorkflowTransitionUpdateParams & { id: string },
  ): Promise<WorkflowTransition>;
  delete(id: string): Promise<string>;
  /** Removes every rule of the workflow that starts or ends at the status. */
  deleteByStatus(workflowId: string, statusId: string): Promise<number>;
  deleteByWorkflowId(workflowId: string): Promise<number>;
  /** Removes rules that start or end at the status, in every workflow. */
  deleteByStatusId(statusId: string): Promise<number>;
}

export class WorkflowTransitionRepositoryImpl
  implements WorkflowTransitionRepository
{
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(
    params: WorkflowTransitionCreateParams,
  ): Promise<WorkflowTransition> {
    const [transition] = await this.createMany([params]);
    return transition;
  }

  async createMany(
    params: WorkflowTransitionCreateParams[],
  ): Promise<WorkflowTransition[]> {
    if (params.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    for (const rule of params) {
      if (!rule.fromStatusId || !rule.toStatusId) {
        throw WorkflowTransitionException.InvalidStatusId();
      }

      if (rule.fromStatusId === rule.toStatusId) {
        throw WorkflowTransitionException.SelfTransition(rule.fromStatusId);
      }

      const key = `${rule.workflowId}:${rule.fromStatusId}:${rule.toStatusId}`;
      if (seen.has(key)) {
        throw WorkflowTransitionException.TransitionAlreadyExists(
          rule.fromStatusId,
          rule.toStatusId,
          rule.workflowId,
        );
      }
      seen.add(key);
    }

    const workflowIds = [...new Set(params.map((rule) => rule.workflowId))];
    for (const workflowId of workflowIds) {
      await this.assertStatusesInWorkflow(
        workflowId,
        params.filter((rule) => rule.workflowId === workflowId),
      );
    }

    for (const rule of params) {
      if (
        await this.exists(rule.workflowId, rule.fromStatusId, rule.toStatusId)
      ) {
        throw WorkflowTransitionException.TransitionAlreadyExists(
          rule.fromStatusId,
          rule.toStatusId,
          rule.workflowId,
        );
      }
    }

    const dataList = await this.transitionModel.insertMany(
      params.map((rule) => ({
        workflowId: new Types.ObjectId(rule.workflowId),
        fromStatusId: new Types.ObjectId(rule.fromStatusId),
        toStatusId: new Types.ObjectId(rule.toStatusId),
      })),
    );

    return dataList.map((item) =>
      WorkflowTransitionMapper.toDomain(
        item as unknown as WorkflowTransitionDocument,
      ),
    );
  }

  async findById(id: string): Promise<WorkflowTransition> {
    const data = await this.transitionModel.findById(id).exec();

    if (!data) {
      throw WorkflowTransitionException.TransitionNotFound(id);
    }

    return WorkflowTransitionMapper.toDomain(data);
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowTransition[]> {
    const dataList = await this.transitionModel
      .find({ workflowId: new Types.ObjectId(workflowId) })
      .sort({ createdAt: 1 })
      .exec();

    return dataList.map((item) => WorkflowTransitionMapper.toDomain(item));
  }

  async findFrom(
    workflowId: string,
    fromStatusId: string,
  ): Promise<WorkflowTransition[]> {
    const dataList = await this.transitionModel
      .find({
        workflowId: new Types.ObjectId(workflowId),
        fromStatusId: new Types.ObjectId(fromStatusId),
      })
      .sort({ createdAt: 1 })
      .exec();

    return dataList.map((item) => WorkflowTransitionMapper.toDomain(item));
  }

  async findOne(
    workflowId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<WorkflowTransition | null> {
    const data = await this.transitionModel
      .findOne({
        workflowId: new Types.ObjectId(workflowId),
        fromStatusId: new Types.ObjectId(fromStatusId),
        toStatusId: new Types.ObjectId(toStatusId),
      })
      .exec();

    return data ? WorkflowTransitionMapper.toDomain(data) : null;
  }

  async exists(
    workflowId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<boolean> {
    const count = await this.transitionModel
      .countDocuments({
        workflowId: new Types.ObjectId(workflowId),
        fromStatusId: new Types.ObjectId(fromStatusId),
        toStatusId: new Types.ObjectId(toStatusId),
      })
      .exec();

    return count > 0;
  }

  async update(
    params: WorkflowTransitionUpdateParams & { id: string },
  ): Promise<WorkflowTransition> {
    const existing = await this.transitionModel.findById(params.id).exec();

    if (!existing) {
      throw WorkflowTransitionException.TransitionNotFound(params.id);
    }

    const workflowId = existing.workflowId.toString();
    const fromStatusId =
      params.fromStatusId ?? existing.fromStatusId.toString();
    const toStatusId = params.toStatusId ?? existing.toStatusId.toString();

    if (fromStatusId === toStatusId) {
      throw WorkflowTransitionException.SelfTransition(fromStatusId);
    }

    await this.assertStatusesInWorkflow(workflowId, [
      { workflowId, fromStatusId, toStatusId },
    ]);

    const duplicate = await this.transitionModel
      .findOne({
        workflowId: existing.workflowId,
        fromStatusId: new Types.ObjectId(fromStatusId),
        toStatusId: new Types.ObjectId(toStatusId),
        _id: { $ne: existing._id },
      })
      .exec();

    if (duplicate) {
      throw WorkflowTransitionException.TransitionAlreadyExists(
        fromStatusId,
        toStatusId,
        workflowId,
      );
    }

    existing.fromStatusId = new Types.ObjectId(fromStatusId);
    existing.toStatusId = new Types.ObjectId(toStatusId);
    existing.updatedAt = new Date();

    await existing.save();

    return WorkflowTransitionMapper.toDomain(existing);
  }

  async delete(id: string): Promise<string> {
    const data = await this.transitionModel.findByIdAndDelete(id).exec();

    if (!data) {
      throw WorkflowTransitionException.TransitionNotFound(id);
    }

    return id;
  }

  async deleteByStatus(workflowId: string, statusId: string): Promise<number> {
    const statusObjectId = new Types.ObjectId(statusId);
    const result = await this.transitionModel
      .deleteMany({
        workflowId: new Types.ObjectId(workflowId),
        $or: [{ fromStatusId: statusObjectId }, { toStatusId: statusObjectId }],
      })
      .exec();

    return result.deletedCount;
  }

  async deleteByWorkflowId(workflowId: string): Promise<number> {
    const result = await this.transitionModel
      .deleteMany({ workflowId: new Types.ObjectId(workflowId) })
      .exec();

    return result.deletedCount;
  }

  async deleteByStatusId(statusId: string): Promise<number> {
    const statusObjectId = new Types.ObjectId(statusId);
    const result = await this.transitionModel
      .deleteMany({
        $or: [{ fromStatusId: statusObjectId }, { toStatusId: statusObjectId }],
      })
      .exec();

    return result.deletedCount;
  }

  /**
   * Both ends of every rule must be statuses of the same workflow. Membership
   * also implies the statuses belong to the workflow's project.
   */
  private async assertStatusesInWorkflow(
    workflowId: string,
    rules: WorkflowTransitionCreateParams[],
  ): Promise<void> {
    const workflow = await this.database
      .workflowModel()
      .findById(workflowId)
      .exec();

    if (!workflow) {
      throw WorkflowTransitionException.InvalidWorkflowId(workflowId);
    }

    const memberships = await this.database
      .workflowStatusModel()
      .find({ workflowId: workflow._id })
      .exec();
    const memberIds = new Set(
      memberships.map((item) => item.statusId.toString()),
    );

    for (const rule of rules) {
      for (const statusId of [rule.fromStatusId, rule.toStatusId]) {
        if (!memberIds.has(statusId)) {
          throw WorkflowTransitionException.StatusNotInWorkflow(
            statusId,
            workflowId,
          );
        }
      }
    }
  }

  private get transitionModel(): Model<WorkflowTransitionDocument> {
    return this.database.workflowTransitionModel();
  }
}
