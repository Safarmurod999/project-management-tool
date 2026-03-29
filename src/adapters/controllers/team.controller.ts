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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateTeamUsecase,
  DeleteTeamUsecase,
  FindTeamByIdUsecase,
  GetTeamsUsecase,
  GetTeamMembersUsecase,
  UpdateTeamUsecase,
} from 'src/application';
import { Response } from 'express';
import {
  PermissionCode,
  RoleCode,
  ScopeType,
  TeamStatus,
} from 'src/infrastructure/common/enum';
import { Permissions, Roles, ScopePermission } from 'src/infrastructure/decorators';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RolesPermissionsGuard, ScopePermissionGuard } from 'src/infrastructure/middlewares';
import {
  CreateTeamPresenter,
  FindTeamByIdPresenter,
  GetTeamsPresenter,
  GetTeamMembersPresenter,
} from '../presenters';

export class CreateTeamDto {
  name: string;
  description: string | null;
  ownerId: string;
  status?: TeamStatus;
  roleId: string;
}

export class GetTeamsQuery {
  userId?: string;
  page?: number;
  limit?: number;
  name?: string;
}

export class GetTeamMembersQuery {
  page?: number;
  limit?: number;
}

@Controller('teams')
@UseGuards(RolesPermissionsGuard, ScopePermissionGuard)
export class TeamController {
  constructor(
    @Inject(UsecaseSymbols.Team.CreateTeamUsecase)
    private readonly createTeamUsecase: CreateTeamUsecase,
    @Inject(PresenterSymbols.Team.CreateTeamPresenter)
    private readonly createTeamPresenter: CreateTeamPresenter,

    @Inject(UsecaseSymbols.Team.FindTeamByIdUsecase)
    private readonly findTeamByIdUsecase: FindTeamByIdUsecase,
    @Inject(PresenterSymbols.Team.FindTeamByIdPresenter)
    private readonly findTeamByIdPresenter: FindTeamByIdPresenter,

    @Inject(UsecaseSymbols.Team.GetTeamsUsecase)
    private readonly getTeamsUsecase: GetTeamsUsecase,
    @Inject(PresenterSymbols.Team.GetTeamsPresenter)
    private readonly getTeamsPresenter: GetTeamsPresenter,

    @Inject(UsecaseSymbols.Membership.GetTeamMembersUsecase)
    private readonly getTeamMembersUsecase: GetTeamMembersUsecase,
    @Inject(PresenterSymbols.Membership.GetTeamMembersPresenter)
    private readonly getTeamMembersPresenter: GetTeamMembersPresenter,

    @Inject(UsecaseSymbols.Team.UpdateTeamUsecase)
    private readonly updateTeamUsecase: UpdateTeamUsecase,
    @Inject(PresenterSymbols.Team.UpdateTeamPresenter)
    private readonly updateTeamPresenter: CreateTeamPresenter,

    @Inject(UsecaseSymbols.Team.DeleteTeamUsecase)
    private readonly deleteTeamUsecase: DeleteTeamUsecase,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.TEAM_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateTeamDto) {
    try {
      const team = await this.createTeamUsecase.execute({
        name: dto.name,
        description: dto.description,
        ownerId: dto.ownerId,
        status: dto.status,
        roleId: dto.roleId
      });

      res.status(HttpStatus.CREATED).send({
        success: true,
        status: HttpStatus.CREATED,
        data: this.createTeamPresenter.present(team),
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
  @Permissions(PermissionCode.TEAM_GET)
  async getAll(@Res() res: Response, @Query() query: GetTeamsQuery) {
    try {
      const teams = await this.getTeamsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        name: query.name,
        userId: query.userId
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getTeamsPresenter.present(teams.data),
        filter: query,
        totalCount: teams.totalCount,
        page: teams.page,
        limit: teams.limit,
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
  @ScopePermission(ScopeType.TEAM, 'id', PermissionCode.TEAM_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const team = await this.findTeamByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findTeamByIdPresenter.present(team),
      });
    } catch (error) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id/members')
  @ScopePermission(ScopeType.TEAM, 'id', PermissionCode.TEAM_GET)
  async getMembers(
    @Res() res: Response,
    @Param('id') id: string,
    @Query() query: GetTeamMembersQuery,
  ) {
    try {
      const members = await this.getTeamMembersUsecase.execute({
        teamId: id,
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getTeamMembersPresenter.present(members.data),
        totalCount: members.totalCount,
        page: members.page,
        limit: members.limit,
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
  @ScopePermission(ScopeType.TEAM, 'id', PermissionCode.TEAM_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: CreateTeamDto,
  ) {
    try {
      const team = await this.updateTeamUsecase.execute({
        id,
        name: dto.name,
        description: dto.description,
        ownerId: dto.ownerId,
        status: dto.status,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateTeamPresenter.present(team),
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
  @ScopePermission(ScopeType.TEAM, 'id', PermissionCode.TEAM_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteTeamUsecase.execute({ id });

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
