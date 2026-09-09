import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateCardUsecase,
  DeleteCardUsecase,
  FindCardByIdUsecase,
  GetCardsUsecase,
  ReorderCardUsecase,
  UpdateCardUsecase,
} from 'src/application';
import { CardStatus, PermissionCode, RoleCode } from 'src/infrastructure/common/enum';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateCardPresenter,
  DeleteCardPresenter,
  FindCardByIdPresenter,
  GetCardsPresenter,
  UpdateCardPresenter,
} from '../presenters';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class CreateCardDto {
  columnId: string;
  title: string;
  description?: string | null;
  order?: number;
  status?: CardStatus;
  assigneeId?: string | null;
  assignerId?: string | null;
  points?: number;
}

export class UpdateCardDto {
  columnId?: string;
  title?: string;
  description?: string | null;
  order?: number;
  status?: CardStatus;
  assigneeId?: string | null;
  assignerId?: string | null;
  points?: number;
  version?: number;
}

export class GetCardsQuery {
  page?: number;
  limit?: number;
  columnId?: string;
  title?: string;
}

export class ReorderCardDto {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
  status?: CardStatus;
}

@Controller('cards')
@UseGuards(RolesPermissionsGuard)
export class CardController {
  constructor(
    @Inject(UsecaseSymbols.Card.CreateCardUsecase)
    private readonly createCardUsecase: CreateCardUsecase,
    @Inject(PresenterSymbols.Card.CreateCardPresenter)
    private readonly createCardPresenter: CreateCardPresenter,
    @Inject(UsecaseSymbols.Card.FindCardByIdUsecase)
    private readonly findCardByIdUsecase: FindCardByIdUsecase,
    @Inject(PresenterSymbols.Card.FindCardByIdPresenter)
    private readonly findCardByIdPresenter: FindCardByIdPresenter,
    @Inject(UsecaseSymbols.Card.GetCardsUsecase)
    private readonly getCardsUsecase: GetCardsUsecase,
    @Inject(PresenterSymbols.Card.GetCardsPresenter)
    private readonly getCardsPresenter: GetCardsPresenter,
    @Inject(UsecaseSymbols.Card.UpdateCardUsecase)
    private readonly updateCardUsecase: UpdateCardUsecase,
    @Inject(UsecaseSymbols.Card.ReorderCardUsecase)
    private readonly reorderCardUsecase: ReorderCardUsecase,
    @Inject(PresenterSymbols.Card.UpdateCardPresenter)
    private readonly updateCardPresenter: UpdateCardPresenter,
    @Inject(UsecaseSymbols.Card.DeleteCardUsecase)
    private readonly deleteCardUsecase: DeleteCardUsecase,
    @Inject(PresenterSymbols.Card.DeleteCardPresenter)
    private readonly deleteCardPresenter: DeleteCardPresenter,
  ) {}

  @Post()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.CARD_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateCardDto) {
    try {
      const card = await this.createCardUsecase.execute({
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        order: dto.order,
        status: dto.status,
        assigneeId: dto.assigneeId,
        assignerId: dto.assignerId,
        points: dto.points,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createCardPresenter.present(card),
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
  @Permissions(PermissionCode.CARD_GET)
  async getAll(@Res() res: Response, @Query() query: GetCardsQuery) {
    try {
      const cards = await this.getCardsUsecase.execute({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        columnId: query.columnId ?? '',
        title: query.title,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getCardsPresenter.present(cards.data),
        filter: query,
        totalCount: cards.totalCount,
        page: cards.page,
        limit: cards.limit,
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
  @Permissions(PermissionCode.CARD_GET)
  async findById(@Res() res: Response, @Param('id') id: string) {
    try {
      const card = await this.findCardByIdUsecase.execute({ id });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.findCardByIdPresenter.present(card),
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
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.CARD_EDIT)
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    try {
      const card = await this.updateCardUsecase.execute({
        id,
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        order: dto.order,
        status: dto.status,
        assigneeId: dto.assigneeId,
        assignerId: dto.assignerId,
        points: dto.points,
        version: dto.version,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateCardPresenter.present(card),
      });
    } catch (error: any) {
      res.status(error.statusCode || HttpStatus.BAD_REQUEST).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('reorder')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.CARD_EDIT)
  async reorder(@Res() res: Response, @Body() dto: ReorderCardDto) {
    try {
      const card = await this.reorderCardUsecase.execute({
        cardId: dto.cardId,
        sourceColumnId: dto.sourceColumnId,
        targetColumnId: dto.targetColumnId,
        newIndex: dto.newIndex,
        status: dto.status,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.updateCardPresenter.present(card),
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
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER)
  @Permissions(PermissionCode.CARD_DELETE)
  async delete(@Res() res: Response, @Param('id') id: string) {
    try {
      const deletedId = await this.deleteCardUsecase.execute({ id });
      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.deleteCardPresenter.present(deletedId),
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
