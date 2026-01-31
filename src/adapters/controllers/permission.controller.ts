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
  CreatePermissionUsecase, DeletePermissionUsecase, FindPermissionByIdUsecase, GetPermissionsUsecase,
  UpdatePermissionUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreatePermissionPresenter, FindPermissionByIdPresenter, GetPermissionsPresenter,
} from '../presenters';

export class CreatePermissionDto {
  name: string;
  description: string;
  isActive?: boolean;
}

export class GetPermissionsQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('permissions')
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
  async create(@Body() dto: CreatePermissionDto) {
    const permission = await this.createPermissionUsecase.execute({
      name: dto.name,
      description: dto.description,
    });

    return {
      status: HttpStatus.CREATED,
      data: this.createPermissionPresenter.present(permission),
    };
  }

  @Get()
  async getAll(@Query() query: GetPermissionsQuery) {
    const permissions = await this.getPermissionsUsecase.execute({
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      name: query.name,
    });

    return {
      status: HttpStatus.OK,
      data: this.getPermissionsPresenter.present(permissions.data),
      filter: query,
      totalCount: permissions.totalCount,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const permission = await this.findPermissionByIdUsecase.execute({ id });

    return {
      status: HttpStatus.OK,
      data: this.findPermissionByIdPresenter.present(permission),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
    const permission = await this.updatePermissionUsecase.execute({
      id: id,
      name: dto.name,
      description: dto.description,
    });
    return {
      status: HttpStatus.OK,
      data: this.updatePermissionPresenter.present(permission),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedId = await this.deletePermissionUsecase.execute({ id });
    return {
      status: HttpStatus.OK,
      data: { id: deletedId },
    };
  }
}
