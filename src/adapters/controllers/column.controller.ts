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
  CreateColumnUsecase,
  DeleteColumnUsecase,
  FindColumnByIdUsecase,
  GetColumnsUsecase,
  UpdateColumnUsecase,
} from 'src/application';
import { BoardStatus, PermissionCode, RoleCode } from 'src/infrastructure/common/enum';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateColumnPresenter,
  DeleteColumnPresenter,
  FindColumnByIdPresenter,
  GetColumnsPresenter,
  UpdateColumnPresenter,
} from '../presenters';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class CreateColumnDto {
  boardId: string;
  name: string;
  order?: number;
  status?: BoardStatus;
}

export class UpdateColumnDto {
  boardId?: string;
  name?: string;
  order?: number;
  status?: BoardStatus;
  version?: number;
}

export class GetColumnsQuery {
  page?: number;
  limit?: number;
  boardId?: string;
  name?: string;
}

@Controller('columns')
@UseGuards(RolesPermissionsGuard)
export class ColumnController {
  constructor(
    @Inject(UsecaseSymbols.Column.CreateColumnUsecase)
    private readonly createColumnUsecase: CreateColumnUsecase,
    @Inject(PresenterSymbols.Column.CreateColumnPresenter)
    private readonly createColumnPresenter: CreateColumnPresenter,
    @Inject(UsecaseSymbols.Column.FindColumnByIdUsecase)
    private readonly findColumnByIdUsecase: FindColumnByIdUsecase,
    @Inject(PresenterSymbols.Column.FindColumnByIdPresenter)
    private readonly findColumnByIdPresenter: FindColumnByIdPresenter,
    @Inject(UsecaseSymbols.Column.GetColumnsUsecase)
    private readonly getColumnsUsecase: GetColumnsUsecase,
    @Inject(PresenterSymbols.Column.GetColumnsPresenter)
    private readonly getColumnsPresenter: GetColumnsPresenter,
    @Inject(UsecaseSymbols.Column.UpdateColumnUsecase)
    private readonly updateColumnUsecase: UpdateColumnUsecase,
    @Inject(PresenterSymbols.Column.UpdateColumnPresenter)
    private readonly updateColumnPresenter: UpdateColumnPresenter,
    @Inject(UsecaseSymbols.Column.DeleteColumnUsecase)
    private readonly deleteColumnUsecase: DeleteColumnUsecase,
    @Inject(PresenterSymbols.Column.DeleteColumnPresenter)
    private readonly deleteColumnPresenter: DeleteColumnPresenter,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.COLUMN_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateColumnDto) {
    try {
      const column = await this.createColumnUsecase.execute({
        boardId: dto.boardId,
        name: dto.name,
        order: dto.order,
        status: dto.status,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createColumnPresenter.present(column),
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
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.COLUMN_GET)
  async getAll(@Res() res: Response, @Query() query: GetColumnsQuery) {
    try {
      const columns = await this.getColumnsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        boardId: query.boardId ?? '',
        name: query.name,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getColumnsPresenter.present(columns.data),
        filter: query,
        totalCount: columns.totalCount,
        page: columns.page,
        limit: columns.limit,
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
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.COLUMN_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const column = await this.findColumnByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findColumnByIdPresenter.present(column),
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
  @Permissions(PermissionCode.COLUMN_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
  ) {
    try {
      const column = await this.updateColumnUsecase.execute({
        id,
        boardId: dto.boardId,
        name: dto.name,
        order: dto.order,
        status: dto.status,
        version: dto.version,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateColumnPresenter.present(column),
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
  @Permissions(PermissionCode.COLUMN_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteColumnUsecase.execute({ id });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.deleteColumnPresenter.present(deletedId),
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
