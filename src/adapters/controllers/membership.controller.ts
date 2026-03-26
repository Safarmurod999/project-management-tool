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
  CreateMembershipUsecase,
  DeleteMembershipUsecase,
  FindMembershipByIdUsecase,
  GetMembershipsUsecase,
  UpdateMembershipUsecase,
} from 'src/application';
import { Response } from 'express';
import { RoleCode, ScopeType } from 'src/infrastructure/common/enum';
import { Roles } from 'src/infrastructure/decorators';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares';
import {
  CreateMembershipPresenter,
  FindMembershipByIdPresenter,
  GetMembershipsPresenter,
} from '../presenters';

export class CreateMembershipDto {
  userId: string;
  scopeType: ScopeType;
  scopeId: string;
  roleId: string;
}

export class GetMembershipsQuery {
  page?: number;
  limit?: number;
  userId?: string;
  scopeType?: ScopeType;
  scopeId?: string;
  roleId?: string;
}

@Controller('memberships')
// @UseGuards(RolesPermissionsGuard)
export class MembershipController {
  constructor(
    @Inject(UsecaseSymbols.Membership.CreateMembershipUsecase)
    private readonly createMembershipUsecase: CreateMembershipUsecase,
    @Inject(PresenterSymbols.Membership.CreateMembershipPresenter)
    private readonly createMembershipPresenter: CreateMembershipPresenter,

    @Inject(UsecaseSymbols.Membership.FindMembershipByIdUsecase)
    private readonly findMembershipByIdUsecase: FindMembershipByIdUsecase,
    @Inject(PresenterSymbols.Membership.FindMembershipByIdPresenter)
    private readonly findMembershipByIdPresenter: FindMembershipByIdPresenter,

    @Inject(UsecaseSymbols.Membership.GetMembershipsUsecase)
    private readonly getMembershipsUsecase: GetMembershipsUsecase,
    @Inject(PresenterSymbols.Membership.GetMembershipsPresenter)
    private readonly getMembershipsPresenter: GetMembershipsPresenter,

    @Inject(UsecaseSymbols.Membership.UpdateMembershipUsecase)
    private readonly updateMembershipUsecase: UpdateMembershipUsecase,
    @Inject(PresenterSymbols.Membership.UpdateMembershipPresenter)
    private readonly updateMembershipPresenter: CreateMembershipPresenter,

    @Inject(UsecaseSymbols.Membership.DeleteMembershipUsecase)
    private readonly deleteMembershipUsecase: DeleteMembershipUsecase,
  ) {}

  @Post()
  // @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  async create(@Res() res: Response, @Body() dto: CreateMembershipDto) {
    try {
      const membership = await this.createMembershipUsecase.execute({
        userId: dto.userId,
        scopeType: dto.scopeType,
        scopeId: dto.scopeId,
        roleId: dto.roleId,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createMembershipPresenter.present(membership),
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
  // @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  async getAll(@Res() res: Response, @Query() query: GetMembershipsQuery) {
    try {
      const memberships = await this.getMembershipsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        userId: query.userId,
        scopeType: query.scopeType,
        scopeId: query.scopeId,
        roleId: query.roleId,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getMembershipsPresenter.present(memberships.data),
        filter: query,
        totalCount: memberships.totalCount,
        page: memberships.page,
        limit: memberships.limit,
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
  // @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const membership = await this.findMembershipByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findMembershipByIdPresenter.present(membership),
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
  // @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: CreateMembershipDto,
  ) {
    try {
      const membership = await this.updateMembershipUsecase.execute({
        id,
        userId: dto.userId,
        scopeType: dto.scopeType,
        scopeId: dto.scopeId,
        roleId: dto.roleId,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateMembershipPresenter.present(membership),
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
  // @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteMembershipUsecase.execute({ id });

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
