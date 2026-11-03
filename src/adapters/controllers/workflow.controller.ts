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
  AddWorkflowStatusUsecase,
  CreateWorkflowTransitionUsecase,
  CreateWorkflowUsecase,
  DeleteWorkflowTransitionUsecase,
  DeleteWorkflowUsecase,
  FindProjectWorkflowUsecase,
  FindWorkflowByIdUsecase,
  GetWorkflowsUsecase,
  RemoveWorkflowStatusUsecase,
  UpdateWorkflowTransitionUsecase,
  UpdateWorkflowUsecase,
} from 'src/application';
import { PermissionCode, RoleCode } from 'src/infrastructure/common/enum';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  DeleteWorkflowPresenter,
  GetWorkflowsPresenter,
  WorkflowDetailsPresenter,
} from '../presenters';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class WorkflowTransitionDto {
  fromStatusId: string;
  toStatusId: string;
  bidirectional?: boolean;
}

export class CreateWorkflowDto {
  projectId: string;
  name: string;
  description?: string | null;
  isDefault?: boolean;
  statusIds?: string[];
  transitions?: WorkflowTransitionDto[];
}

export class UpdateWorkflowDto {
  name?: string;
  description?: string | null;
  isDefault?: boolean;
  version?: number;
}

export class GetWorkflowsQuery {
  page?: number;
  limit?: number;
  projectId?: string;
  name?: string;
}

export class GetProjectWorkflowQuery {
  projectId?: string;
}

export class AddWorkflowStatusDto {
  statusId: string;
}

export class UpdateWorkflowTransitionDto {
  fromStatusId?: string;
  toStatusId?: string;
}

@Controller('workflows')
@UseGuards(RolesPermissionsGuard)
export class WorkflowController {
  constructor(
    @Inject(UsecaseSymbols.Workflow.CreateWorkflowUsecase)
    private readonly createWorkflowUsecase: CreateWorkflowUsecase,
    @Inject(UsecaseSymbols.Workflow.GetWorkflowsUsecase)
    private readonly getWorkflowsUsecase: GetWorkflowsUsecase,
    @Inject(UsecaseSymbols.Workflow.FindWorkflowByIdUsecase)
    private readonly findWorkflowByIdUsecase: FindWorkflowByIdUsecase,
    @Inject(UsecaseSymbols.Workflow.FindProjectWorkflowUsecase)
    private readonly findProjectWorkflowUsecase: FindProjectWorkflowUsecase,
    @Inject(UsecaseSymbols.Workflow.UpdateWorkflowUsecase)
    private readonly updateWorkflowUsecase: UpdateWorkflowUsecase,
    @Inject(UsecaseSymbols.Workflow.DeleteWorkflowUsecase)
    private readonly deleteWorkflowUsecase: DeleteWorkflowUsecase,
    @Inject(UsecaseSymbols.Workflow.AddWorkflowStatusUsecase)
    private readonly addWorkflowStatusUsecase: AddWorkflowStatusUsecase,
    @Inject(UsecaseSymbols.Workflow.RemoveWorkflowStatusUsecase)
    private readonly removeWorkflowStatusUsecase: RemoveWorkflowStatusUsecase,
    @Inject(UsecaseSymbols.Workflow.CreateWorkflowTransitionUsecase)
    private readonly createWorkflowTransitionUsecase: CreateWorkflowTransitionUsecase,
    @Inject(UsecaseSymbols.Workflow.UpdateWorkflowTransitionUsecase)
    private readonly updateWorkflowTransitionUsecase: UpdateWorkflowTransitionUsecase,
    @Inject(UsecaseSymbols.Workflow.DeleteWorkflowTransitionUsecase)
    private readonly deleteWorkflowTransitionUsecase: DeleteWorkflowTransitionUsecase,
    @Inject(PresenterSymbols.Workflow.GetWorkflowsPresenter)
    private readonly getWorkflowsPresenter: GetWorkflowsPresenter,
    @Inject(PresenterSymbols.Workflow.WorkflowDetailsPresenter)
    private readonly workflowDetailsPresenter: WorkflowDetailsPresenter,
    @Inject(PresenterSymbols.Workflow.DeleteWorkflowPresenter)
    private readonly deleteWorkflowPresenter: DeleteWorkflowPresenter,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateWorkflowDto) {
    try {
      const details = await this.createWorkflowUsecase.execute({
        projectId: dto.projectId,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault,
        statusIds: dto.statusIds,
        transitions: dto.transitions?.map((transition) => ({
          fromStatusId: transition.fromStatusId,
          toStatusId: transition.toStatusId,
          bidirectional: transition.bidirectional,
        })),
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Get()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  @Permissions(PermissionCode.WORKFLOW_GET)
  async getAll(@Res() res: Response, @Query() query: GetWorkflowsQuery) {
    try {
      const workflows = await this.getWorkflowsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        projectId: query.projectId ?? '',
        name: query.name,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getWorkflowsPresenter.present(workflows.data),
        filter: query,
        totalCount: workflows.totalCount,
        page: workflows.page,
        limit: workflows.limit,
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  // Declared before `:id` so "default" is not treated as an id.
  @Get('default')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  @Permissions(PermissionCode.WORKFLOW_GET)
  async findProjectWorkflow(
    @Res() res: Response,
    @Query() query: GetProjectWorkflowQuery,
  ) {
    try {
      const details = await this.findProjectWorkflowUsecase.execute({
        projectId: query.projectId ?? '',
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Get(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  @Permissions(PermissionCode.WORKFLOW_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const details = await this.findWorkflowByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Put(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    try {
      const details = await this.updateWorkflowUsecase.execute({
        id,
        name: dto.name,
        description: dto.description,
        isDefault: dto.isDefault,
        version: dto.version,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteWorkflowUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.deleteWorkflowPresenter.present(deletedId),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Post(':id/statuses')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_EDIT)
  async addStatus(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: AddWorkflowStatusDto,
  ) {
    try {
      const details = await this.addWorkflowStatusUsecase.execute({
        workflowId: id,
        statusId: dto.statusId,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Delete(':id/statuses/:statusId')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_EDIT)
  async removeStatus(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('statusId') statusId: string,
  ) {
    try {
      const details = await this.removeWorkflowStatusUsecase.execute({
        workflowId: id,
        statusId,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Post(':id/transitions')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_EDIT)
  async createTransition(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: WorkflowTransitionDto,
  ) {
    try {
      const details = await this.createWorkflowTransitionUsecase.execute({
        workflowId: id,
        fromStatusId: dto.fromStatusId,
        toStatusId: dto.toStatusId,
        bidirectional: dto.bidirectional,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Put(':id/transitions/:transitionId')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_EDIT)
  async updateTransition(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('transitionId') transitionId: string,
    @Body() dto: UpdateWorkflowTransitionDto,
  ) {
    try {
      const details = await this.updateWorkflowTransitionUsecase.execute({
        workflowId: id,
        transitionId,
        fromStatusId: dto.fromStatusId,
        toStatusId: dto.toStatusId,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  @Delete(':id/transitions/:transitionId')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.WORKFLOW_EDIT)
  async deleteTransition(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('transitionId') transitionId: string,
  ) {
    try {
      const details = await this.deleteWorkflowTransitionUsecase.execute({
        workflowId: id,
        transitionId,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.workflowDetailsPresenter.present(details),
      });
    } catch (error: any) {
      this.sendError(res, error);
    }
  }

  private sendError(res: Response, error: any) {
    res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
      status: error.statusCode || HttpStatus.BAD_REQUEST,
      success: false,
      message: error.message,
    });
  }
}
