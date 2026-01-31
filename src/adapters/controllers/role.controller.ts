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
  CreateRoleUsecase,
  DeleteRoleUsecase,
  FindRoleByIdUsecase,
  GetRolesUsecase,
  UpdateRoleUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateRolePresenter,
  FindRoleByIdPresenter,
  GetRolesPresenter,
} from '../presenters';
import { RoleCode, RoleStatus } from 'src/infrastructure/common/enum';
import { Response } from 'express';
import { Permissions, Roles } from 'src/infrastructure/decorators';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares';

export class CreateRoleDto {
  name: RoleCode;
  permissions: string[];
  description: string;
  status?: RoleStatus;
}

export class GetRolesQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('roles')
@UseGuards(RolesPermissionsGuard)
export class RoleController {
  constructor(
    @Inject(UsecaseSymbols.Role.CreateRoleUsecase)
    private readonly createRoleUsecase: CreateRoleUsecase,
    @Inject(PresenterSymbols.Role.CreateRolePresenter)
    private readonly createRolePresenter: CreateRolePresenter,

    @Inject(UsecaseSymbols.Role.FindRoleByIdUsecase)
    private readonly findRoleByIdUsecase: FindRoleByIdUsecase,
    @Inject(PresenterSymbols.Role.FindRoleByIdPresenter)
    private readonly findRoleByIdPresenter: FindRoleByIdPresenter,

    @Inject(UsecaseSymbols.Role.GetRolesUsecase)
    private readonly getRolesUsecase: GetRolesUsecase,
    @Inject(PresenterSymbols.Role.GetRolesPresenter)
    private readonly getRolesPresenter: GetRolesPresenter,

    @Inject(UsecaseSymbols.Role.UpdateRoleUsecase)
    private readonly updateRoleUsecase: UpdateRoleUsecase,
    @Inject(PresenterSymbols.Role.UpdateRolePresenter)
    private readonly updateRolePresenter: CreateRolePresenter,

    @Inject(UsecaseSymbols.Role.DeleteRoleUsecase)
    private readonly deleteRoleUsecase: DeleteRoleUsecase,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions('user:create')
  async create(@Res() res: Response, @Body() dto: CreateRoleDto) {
    try {
      const role = await this.createRoleUsecase.execute({
        name: dto.name,
        permissions: dto.permissions,
        description: dto.description,
        status: dto.status,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createRolePresenter.present(role),
      });
    } catch (error) {
      res.status(error.statusCode).send({
        success: false,
        status: error.statusCode,
        message: error.message,
      });
    }
  }

  @Get()
  async getAll(@Res() res: Response, @Query() query: GetRolesQuery) {
    try {
      const roles = await this.getRolesUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        name: query.name,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getRolesPresenter.present(roles.data),
        filter: query,
        totalCount: roles.totalCount,
        page: roles.page,
        limit: roles.limit,
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
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const role = await this.findRoleByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findRoleByIdPresenter.present(role),
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
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: CreateRoleDto,
  ) {
    try {
      const role = await this.updateRoleUsecase.execute({
        id: id,
        name: dto.name,
        permissions: dto.permissions,
        description: dto.description,
        status: dto.status,
      });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateRolePresenter.present(role),
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
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteRoleUsecase.execute({ id });
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
