import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { WorkflowDocument } from 'src/infrastructure/database/mongodb/models';
import { WorkflowMapper } from 'src/infrastructure/database/mongodb/mappers';
import { WORKFLOW_NAME_COLLATION } from 'src/infrastructure/database/mongodb/schemas';
import { Workflow } from './entity';
import { WorkflowStruct } from './factory';
import { WorkflowException } from './exception';

export type WorkflowCreateParams = Omit<
  WorkflowStruct,
  'id' | 'createdAt' | 'updatedAt' | 'version'
>;

export type WorkflowUpdateParams = Partial<
  Omit<WorkflowStruct, 'createdAt' | 'projectId'>
>;

export interface WorkflowGetQuery {
  page?: number;
  limit?: number;
  projectId: string;
  name?: string;
}

export interface WorkflowGetResponse {
  data: Workflow[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface WorkflowRepository {
  create(workflow: WorkflowCreateParams): Promise<Workflow>;
  find(params: WorkflowGetQuery): Promise<WorkflowGetResponse>;
  findById(id: string): Promise<Workflow>;
  findByProjectId(projectId: string): Promise<Workflow[]>;
  findDefaultByProjectId(projectId: string): Promise<Workflow | null>;
  update(workflow: WorkflowUpdateParams & { id: string }): Promise<Workflow>;
  /** Clears `isDefault` on every workflow of the project except `exceptId`. */
  clearDefault(projectId: string, exceptId?: string): Promise<void>;
  delete(id: string): Promise<string>;
}

export class WorkflowRepositoryImpl implements WorkflowRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(workflow: WorkflowCreateParams): Promise<Workflow> {
    await this.assertProjectExists(workflow.projectId);
    await this.assertNameAvailable(workflow.projectId, workflow.name);

    const workflowData = await this.workflowModel.create({
      ...workflow,
      projectId: new Types.ObjectId(workflow.projectId),
    });

    return WorkflowMapper.toDomain(workflowData);
  }

  async find(params: WorkflowGetQuery): Promise<WorkflowGetResponse> {
    const { page = 1, limit = 50, projectId, name } = params;

    const filter: Record<string, any> = {
      projectId: new Types.ObjectId(projectId),
    };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const totalCount = await this.workflowModel.countDocuments(filter);

    const workflowDataList = await this.workflowModel
      .find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: workflowDataList.map((item) => WorkflowMapper.toDomain(item)),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Workflow> {
    const workflowData = await this.workflowModel.findById(id).exec();

    if (!workflowData) {
      throw WorkflowException.WorkflowNotFound(id);
    }

    return WorkflowMapper.toDomain(workflowData);
  }

  async findByProjectId(projectId: string): Promise<Workflow[]> {
    const workflowDataList = await this.workflowModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ createdAt: 1 })
      .exec();

    return workflowDataList.map((item) => WorkflowMapper.toDomain(item));
  }

  async findDefaultByProjectId(projectId: string): Promise<Workflow | null> {
    const workflowData = await this.workflowModel
      .findOne({ projectId: new Types.ObjectId(projectId), isDefault: true })
      .exec();

    return workflowData ? WorkflowMapper.toDomain(workflowData) : null;
  }

  async update(
    workflow: WorkflowUpdateParams & { id: string },
  ): Promise<Workflow> {
    const existingWorkflow = await this.workflowModel
      .findById(workflow.id)
      .exec();

    if (!existingWorkflow) {
      throw WorkflowException.WorkflowNotFound(workflow.id);
    }

    if (workflow.name && workflow.name !== existingWorkflow.name) {
      await this.assertNameAvailable(
        existingWorkflow.projectId.toString(),
        workflow.name,
        existingWorkflow._id.toString(),
      );

      existingWorkflow.name = workflow.name;
    }

    if (workflow.description !== undefined)
      existingWorkflow.description = workflow.description;
    if (workflow.isDefault !== undefined)
      existingWorkflow.isDefault = workflow.isDefault;
    if (workflow.version) existingWorkflow.version = workflow.version;
    existingWorkflow.updatedAt = new Date();

    await existingWorkflow.save();

    return WorkflowMapper.toDomain(existingWorkflow);
  }

  async clearDefault(projectId: string, exceptId?: string): Promise<void> {
    const filter: Record<string, any> = {
      projectId: new Types.ObjectId(projectId),
      isDefault: true,
    };

    if (exceptId) {
      filter._id = { $ne: new Types.ObjectId(exceptId) };
    }

    await this.workflowModel
      .updateMany(filter, { $set: { isDefault: false, updatedAt: new Date() } })
      .exec();
  }

  async delete(id: string): Promise<string> {
    const workflow = await this.workflowModel.findById(id).exec();

    if (!workflow) {
      throw WorkflowException.WorkflowNotFound(id);
    }

    await this.workflowModel.findByIdAndDelete(id).exec();
    return id;
  }

  /** Workflow names are unique per project, ignoring case. */
  private async assertNameAvailable(
    projectId: string,
    name: string,
    exceptId?: string,
  ): Promise<void> {
    const filter: Record<string, any> = {
      projectId: new Types.ObjectId(projectId),
      name,
    };

    if (exceptId) {
      filter._id = { $ne: new Types.ObjectId(exceptId) };
    }

    const duplicate = await this.workflowModel
      .findOne(filter)
      .collation(WORKFLOW_NAME_COLLATION)
      .exec();

    if (duplicate) {
      throw WorkflowException.WorkflowAlreadyExists(name, projectId);
    }
  }

  private async assertProjectExists(projectId: string): Promise<void> {
    const project = await this.database
      .projectModel()
      .findById(projectId)
      .exec();

    if (!project) {
      throw WorkflowException.InvalidProjectId(projectId);
    }
  }

  private get workflowModel(): Model<WorkflowDocument> {
    return this.database.workflowModel();
  }
}
