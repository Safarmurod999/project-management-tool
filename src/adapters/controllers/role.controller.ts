import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put, Query,
} from '@nestjs/common';
import {
  CreateRoleUsecase, DeleteRoleUsecase, FindRoleByIdUsecase, GetRolesUsecase,
  UpdateRoleUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateRolePresenter, FindRoleByIdPresenter, GetRolesPresenter,
} from '../presenters';

export class CreateRoleDto {
  name: string;
  permissions: string[];
  description: string;
  isActive?: boolean;
}

export class GetRolesQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('roles')
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
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.createRoleUsecase.execute({
      name: dto.name,
      permissions: dto.permissions,
      description: dto.description,
    });

    return {
      status: HttpStatus.CREATED,
      data: this.createRolePresenter.present(role),
    };
  }

  @Get()
  async getAll(@Query() query: GetRolesQuery) {
    const roles = await this.getRolesUsecase.execute({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      name: query.name,
    });

    return {
      status: HttpStatus.OK,
      data: this.getRolesPresenter.present(roles.data),
      filter: query,
      totalCount: roles.totalCount,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const role = await this.findRoleByIdUsecase.execute({ id });

    return {
      status: HttpStatus.OK,
      data: this.findRoleByIdPresenter.present(role),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateRoleDto) {
    const role = await this.updateRoleUsecase.execute({
      id: id,
      name: dto.name,
      permissions: dto.permissions,
      description: dto.description,
    });
    return {
      status: HttpStatus.OK,
      data: this.updateRolePresenter.present(role),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedId = await this.deleteRoleUsecase.execute({ id });
    return {
      status: HttpStatus.OK,
      data: { id: deletedId },
    };
  }
}
