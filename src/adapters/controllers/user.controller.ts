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
  CreateUserUsecase,
  DeleteUserUsecase,
  FindUserByEmailUsecase,
  FindUserByIdUsecase,
  GetUsersUsecase,
  UpdateUserUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateUserPresenter,
  FindUserByEmailPresenter,
  FindUserByIdPresenter,
  GetUsersPresenter,
  UpdateUserPresenter,
} from '../presenters';
import { PermissionCode, RoleCode, UserStatus } from 'src/infrastructure/common/enum';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  status: UserStatus;
}

export class GetUsersQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('users')
@UseGuards(RolesPermissionsGuard)
export class UserController {
  constructor(
    @Inject(UsecaseSymbols.User.CreateUserUsecase)
    private readonly createUserUsecase: CreateUserUsecase,
    @Inject(PresenterSymbols.User.CreateUserPresenter)
    private readonly createUserPresenter: CreateUserPresenter,

    @Inject(UsecaseSymbols.User.GetUsersUsecase)
    private readonly getUsersUsecase: GetUsersUsecase,
    @Inject(PresenterSymbols.User.GetUsersPresenter)
    private readonly getUsersPresenter: GetUsersPresenter,

    @Inject(UsecaseSymbols.User.FindUserByIdUsecase)
    private readonly findUserByIdUsecase: FindUserByIdUsecase,
    @Inject(PresenterSymbols.User.FindUserByIdPresenter)
    private readonly findUserByIdPresenter: FindUserByIdPresenter,

    @Inject(UsecaseSymbols.User.FindUserByEmailUsecase)
    private readonly findUserByEmailUsecase: FindUserByEmailUsecase,
    @Inject(PresenterSymbols.User.FindUserByEmailPresenter)
    private readonly findUserByEmailPresenter: FindUserByEmailPresenter,

    @Inject(UsecaseSymbols.User.UpdateUserUsecase)
    private readonly updateUserUsecase: UpdateUserUsecase,
    @Inject(PresenterSymbols.User.UpdateUserPresenter)
    private readonly updateUserPresenter: UpdateUserPresenter,

    @Inject(UsecaseSymbols.User.DeleteUserUsecase)
    private readonly deleteUserUsecase: DeleteUserUsecase,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.USER_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateUserDto) {
    try {
      const user = await this.createUserUsecase.execute({
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: dto.role,
        status: dto.status,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createUserPresenter.present(user),
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
  @Permissions(PermissionCode.USER_GET)
  async getAll(@Res() res: Response, @Query() query: GetUsersQuery) {
    try {
      const roles = await this.getUsersUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        name: query.name,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getUsersPresenter.present(roles.data),
        filter: query,
        totalCount: roles.totalCount,
        page: roles.page,
        limit: roles.limit,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.USER_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const user = await this.findUserByIdUsecase.execute({ id });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findUserByIdPresenter.present(user),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get('email/:email')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.USER_GET)
  async findByEmail(@Res() res: Response, @Param('email') email: string) {
    try {
      const user = await this.findUserByEmailUsecase.execute({ email });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findUserByEmailPresenter.present(user),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Put(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.USER_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: CreateUserDto & { isVerified: boolean },
  ) {
    try {
      const user = await this.updateUserUsecase.execute({
        id,
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: dto.role,
        isVerified: dto.isVerified,
        status: dto.status,
      });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateUserPresenter.present(user),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  @Permissions(PermissionCode.USER_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedUserId = await this.deleteUserUsecase.execute({ id });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: deletedUserId,
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        success: false,
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
