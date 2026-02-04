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
  CreatePermissionUsecase,
  DeletePermissionUsecase,
  FindPermissionByIdUsecase,
  GetPermissionsUsecase,
  UpdatePermissionUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreatePermissionPresenter,
  FindPermissionByIdPresenter,
  GetPermissionsPresenter,
} from '../presenters';
import {
  PermissionCode,
  PermissionStatus,
  RoleCode,
} from 'src/infrastructure/common/enum';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class CreatePermissionDto {
  code: PermissionCode;
  status?: PermissionStatus;
}

export class GetPermissionsQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('permissions')
@UseGuards(RolesPermissionsGuard)
export class PermissionController {
  constructor(
    @Inject(UsecaseSymbols.Permission.CreatePermissionUsecase)
    private readonly createPermissionUsecase: CreatePermissionUsecase,
    @Inject(PresenterSymbols.Permission.CreatePermissionPresenter)
    private readonly createPermissionPresenter: CreatePermissionPresenter,

    @Inject(UsecaseSymbols.Permission.FindPermissionByIdUsecase)
    private readonly findPermissionByIdUsecase: FindPermissionByIdUsecase,
    @Inject(PresenterSymbols.Permission.FindPermissionByIdPresenter)
    private readonly findPermissionByIdPresenter: FindPermissionByIdPresenter,

    @Inject(UsecaseSymbols.Permission.GetPermissionsUsecase)
    private readonly getPermissionsUsecase: GetPermissionsUsecase,
    @Inject(PresenterSymbols.Permission.GetPermissionsPresenter)
    private readonly getPermissionsPresenter: GetPermissionsPresenter,

    @Inject(UsecaseSymbols.Permission.UpdatePermissionUsecase)
    private readonly updatePermissionUsecase: UpdatePermissionUsecase,
    @Inject(PresenterSymbols.Permission.UpdatePermissionPresenter)
    private readonly updatePermissionPresenter: CreatePermissionPresenter,

    @Inject(UsecaseSymbols.Permission.DeletePermissionUsecase)
    private readonly deletePermissionUsecase: DeletePermissionUsecase,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.PERMISSION_CREATE)
  async create(@Res() res: Response, @Body() dto: CreatePermissionDto) {
    try {
      const permission = await this.createPermissionUsecase.execute({
        code: dto.code,
        status: dto.status,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createPermissionPresenter.present(permission),
      });
    } catch (error) {
      res.status(error.statusCode).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Get()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.PERMISSION_GET)
  async getAll(@Res() res: Response, @Query() query: GetPermissionsQuery) {
    try {
      const permissions = await this.getPermissionsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        name: query.name,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getPermissionsPresenter.present(permissions.data),
        filter: query,
        totalCount: permissions.totalCount,
        page: permissions.page,
        limit: permissions.limit,
      });
    } catch (error) {
      res.status(error.statusCode).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.PERMISSION_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const permission = await this.findPermissionByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findPermissionByIdPresenter.present(permission),
      });
    } catch (error) {
      res.status(error.statusCode).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Put(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.PERMISSION_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: CreatePermissionDto,
  ) {
    try {
      const permission = await this.updatePermissionUsecase.execute({
        id: id,
        code: dto.code,
        status: dto.status,
      });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updatePermissionPresenter.present(permission),
      });
    } catch (error) {
      res.status(error.statusCode).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.PERMISSION_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deletePermissionUsecase.execute({ id });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: { id: deletedId },
      });
    } catch (error) {
      res.status(error.statusCode).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }
}
