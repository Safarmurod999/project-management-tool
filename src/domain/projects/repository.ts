import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { Project } from './entity';
import { ProjectStruct } from './factory';
import { ProjectMapper } from '../../infrastructure/database/mongodb/mappers';
import { ProjectException } from './exception';
import { ProjectDocument } from '../../infrastructure/database/mongodb/models';

export type ProjectCreateParams = Omit<
  ProjectStruct,
  'id' | 'createdAt' | 'updatedAt'
>;

export type ProjectUpdateParams = Partial<Omit<ProjectStruct, 'createdAt'>>;

export interface ProjectGetQuery {
  page?: number;
  limit?: number;
  name?: string;
}

export interface ProjectGetResponse {
  data: Project[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface ProjectRepository {
  create(project: ProjectCreateParams): Promise<Project>;
  find(params: ProjectGetQuery): Promise<ProjectGetResponse>;
  findByIds(ids: string[], name?: string): Promise<Project[]>;
  findByTeamIds(teamIds: string[], name?: string): Promise<Project[]>;
  findById(id: string): Promise<Project>;
  update(project: ProjectUpdateParams & { id: string }): Promise<Project>;
  delete(id: string): Promise<string>;
}

export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(project: ProjectCreateParams): Promise<Project> {
    const projectData = await this.projectModel.create({
      ...project,
    });

    return ProjectMapper.toDomain(projectData);
  }

  async find(params: ProjectGetQuery): Promise<ProjectGetResponse> {
    const { page = 1, limit = 10, name } = params;

    const filter: Record<string, any> = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const totalCount = await this.projectModel.countDocuments(filter);

    const projectDataList = await this.projectModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: projectDataList.map((t) => ProjectMapper.toDomain(t)),
      page,
      limit,
      totalCount,
    };
  }

  async findByIds(ids: string[], name?: string): Promise<Project[]> {
    if (ids.length === 0) {
      return [];
    }

    const filter: Record<string, unknown> = {
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const projectDataList = await this.projectModel.find(filter).exec();

    return projectDataList.map((project) => ProjectMapper.toDomain(project));
  }

  async findByTeamIds(teamIds: string[], name?: string): Promise<Project[]> {
    if (teamIds.length === 0) {
      return [];
    }

    const filter: Record<string, unknown> = {
      teamId: { $in: teamIds.map((teamId) => new Types.ObjectId(teamId)) },
    };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const projectDataList = await this.projectModel.find(filter).exec();

    return projectDataList.map((project) => ProjectMapper.toDomain(project));
  }

  async findById(id: string): Promise<Project> {
    const projectData = await this.projectModel.findById(id).exec();

    if (!projectData) {
      throw ProjectException.ProjectNotFound(id);
    }

    return ProjectMapper.toDomain(projectData);
  }

  async update(
    project: ProjectUpdateParams & { id: string },
  ): Promise<Project> {
    const projectData = await this.projectModel.findById(project.id);

    if (!projectData) {
      throw ProjectException.ProjectNotFound(project.id);
    }

    projectData.name = project.name ?? projectData.name;
    projectData.description = project.description ?? projectData.description;
    if (project.teamId) {
      projectData.teamId = new Types.ObjectId(project.teamId);
    }
    projectData.status = project.status ?? projectData.status;
    projectData.updatedAt = new Date();

    await projectData.save();

    return ProjectMapper.toDomain(projectData);
  }

  async delete(id: string): Promise<string> {
    await this.projectModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get projectModel(): Model<ProjectDocument> {
    return this.database.projectModel();
  }
}
