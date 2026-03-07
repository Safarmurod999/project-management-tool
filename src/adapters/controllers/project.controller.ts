import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateProjectUsecase,
  DeleteProjectUsecase,
  FindProjectByIdUsecase,
  GetProjectsUsecase,
  UpdateProjectUsecase,
} from 'src/application';
import { Response } from 'express';
import {
  PermissionCode,
  ProjectStatus,
  RoleCode,
  ScopeType,
} from 'src/infrastructure/common/enum';
import { Permissions, Roles, ScopePermission } from 'src/infrastructure/decorators';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RolesPermissionsGuard, ScopePermissionGuard } from 'src/infrastructure/middlewares';
import {
  CreateProjectPresenter,
  FindProjectByIdPresenter,
  GetProjectsPresenter,
} from '../presenters';

export class CreateProjectDto {
  name: string;
  description: string | null;
  teamId: string;
  status?: ProjectStatus;
}

export class GetProjectsQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('projects')
@UseGuards(RolesPermissionsGuard, ScopePermissionGuard)
export class ProjectController {
  constructor(
    @Inject(UsecaseSymbols.Project.CreateProjectUsecase)
    private readonly createProjectUsecase: CreateProjectUsecase,
    @Inject(PresenterSymbols.Project.CreateProjectPresenter)
    private readonly createProjectPresenter: CreateProjectPresenter,

    @Inject(UsecaseSymbols.Project.FindProjectByIdUsecase)
    private readonly findProjectByIdUsecase: FindProjectByIdUsecase,
    @Inject(PresenterSymbols.Project.FindProjectByIdPresenter)
    private readonly findProjectByIdPresenter: FindProjectByIdPresenter,

    @Inject(UsecaseSymbols.Project.GetProjectsUsecase)
    private readonly getProjectsUsecase: GetProjectsUsecase,
    @Inject(PresenterSymbols.Project.GetProjectsPresenter)
    private readonly getProjectsPresenter: GetProjectsPresenter,

    @Inject(UsecaseSymbols.Project.UpdateProjectUsecase)
    private readonly updateProjectUsecase: UpdateProjectUsecase,
    @Inject(PresenterSymbols.Project.UpdateProjectPresenter)
    private readonly updateProjectPresenter: CreateProjectPresenter,

    @Inject(UsecaseSymbols.Project.DeleteProjectUsecase)
    private readonly deleteProjectUsecase: DeleteProjectUsecase,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.PROJECT_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateProjectDto) {
    try {
      const project = await this.createProjectUsecase.execute({
        name: dto.name,
        description: dto.description,
        teamId: dto.teamId,
        status: dto.status,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createProjectPresenter.present(project),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.PROJECT_GET)
  async getAll(@Res() res: Response, @Query() query: GetProjectsQuery) {
    try {
      const projects = await this.getProjectsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        name: query.name,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getProjectsPresenter.present(projects.data),
        filter: query,
        totalCount: projects.totalCount,
        page: projects.page,
        limit: projects.limit,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  @ScopePermission(ScopeType.PROJECT, 'id', PermissionCode.PROJECT_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const project = await this.findProjectByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findProjectByIdPresenter.present(project),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Put(':id')
  @ScopePermission(ScopeType.PROJECT, 'id', PermissionCode.PROJECT_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: CreateProjectDto,
  ) {
    try {
      const project = await this.updateProjectUsecase.execute({
        id,
        name: dto.name,
        description: dto.description,
        teamId: dto.teamId,
        status: dto.status,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateProjectPresenter.present(project),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @ScopePermission(ScopeType.PROJECT, 'id', PermissionCode.PROJECT_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteProjectUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: { id: deletedId },
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }
}
