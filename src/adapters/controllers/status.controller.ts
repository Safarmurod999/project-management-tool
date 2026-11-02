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
  CreateStatusUsecase,
  DeleteStatusUsecase,
  FindStatusByIdUsecase,
  GetStatusesUsecase,
  UpdateStatusUsecase,
} from 'src/application';
import { PermissionCode, RoleCode } from 'src/infrastructure/common/enum';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateStatusPresenter,
  DeleteStatusPresenter,
  FindStatusByIdPresenter,
  GetStatusesPresenter,
  UpdateStatusPresenter,
} from '../presenters';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class CreateStatusDto {
  projectId: string;
  name: string;
  code?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
}

export class UpdateStatusDto {
  name?: string;
  code?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  version?: number;
}

export class GetStatusesQuery {
  page?: number;
  limit?: number;
  projectId?: string;
  name?: string;
  code?: string;
}

@Controller('statuses')
@UseGuards(RolesPermissionsGuard)
export class StatusController {
  constructor(
    @Inject(UsecaseSymbols.Status.CreateStatusUsecase)
    private readonly createStatusUsecase: CreateStatusUsecase,
    @Inject(PresenterSymbols.Status.CreateStatusPresenter)
    private readonly createStatusPresenter: CreateStatusPresenter,
    @Inject(UsecaseSymbols.Status.FindStatusByIdUsecase)
    private readonly findStatusByIdUsecase: FindStatusByIdUsecase,
    @Inject(PresenterSymbols.Status.FindStatusByIdPresenter)
    private readonly findStatusByIdPresenter: FindStatusByIdPresenter,
    @Inject(UsecaseSymbols.Status.GetStatusesUsecase)
    private readonly getStatusesUsecase: GetStatusesUsecase,
    @Inject(PresenterSymbols.Status.GetStatusesPresenter)
    private readonly getStatusesPresenter: GetStatusesPresenter,
    @Inject(UsecaseSymbols.Status.UpdateStatusUsecase)
    private readonly updateStatusUsecase: UpdateStatusUsecase,
    @Inject(PresenterSymbols.Status.UpdateStatusPresenter)
    private readonly updateStatusPresenter: UpdateStatusPresenter,
    @Inject(UsecaseSymbols.Status.DeleteStatusUsecase)
    private readonly deleteStatusUsecase: DeleteStatusUsecase,
    @Inject(PresenterSymbols.Status.DeleteStatusPresenter)
    private readonly deleteStatusPresenter: DeleteStatusPresenter,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.STATUS_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateStatusDto) {
    try {
      const status = await this.createStatusUsecase.execute({
        projectId: dto.projectId,
        name: dto.name,
        code: dto.code,
        color: dto.color,
        order: dto.order,
        isDefault: dto.isDefault,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createStatusPresenter.present(status),
      });
    } catch (error: any) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Get()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  @Permissions(PermissionCode.STATUS_GET)
  async getAll(@Res() res: Response, @Query() query: GetStatusesQuery) {
    try {
      const statuses = await this.getStatusesUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        projectId: query.projectId ?? '',
        name: query.name,
        code: query.code,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getStatusesPresenter.present(statuses.data),
        filter: query,
        totalCount: statuses.totalCount,
        page: statuses.page,
        limit: statuses.limit,
      });
    } catch (error: any) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  @Permissions(PermissionCode.STATUS_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const status = await this.findStatusByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findStatusByIdPresenter.present(status),
      });
    } catch (error: any) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Put(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.STATUS_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    try {
      const status = await this.updateStatusUsecase.execute({
        id,
        name: dto.name,
        code: dto.code,
        color: dto.color,
        order: dto.order,
        isDefault: dto.isDefault,
        version: dto.version,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateStatusPresenter.present(status),
      });
    } catch (error: any) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.STATUS_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteStatusUsecase.execute({ id });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.deleteStatusPresenter.present(deletedId),
      });
    } catch (error: any) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }
}
