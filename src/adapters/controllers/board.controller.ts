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
  CreateBoardUsecase,
  //   DeleteBoardUsecase,
  //   FindBoardByIdUsecase,
  //   GetBoardsUsecase,
  //   UpdateBoardUsecase,
} from 'src/application';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import {
  CreateBoardPresenter,
  //   FindBoardByIdPresenter,
  //   GetBoardsPresenter,
} from '../presenters';
import {
  BoardStatus,
  PermissionCode,
  RoleCode,
} from 'src/infrastructure/common/enum';
import { Response } from 'express';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { Permissions, Roles } from 'src/infrastructure/decorators';

export class CreateBoardDto {
  projectId: string;
  name: string;
  description: string;
}

export class GetBoardsQuery {
  page?: number;
  limit?: number;
  name?: string;
}

@Controller('boards')
// @UseGuards(RolesPermissionsGuard)
export class BoardController {
  constructor(

    @Inject(UsecaseSymbols.Board.CreateBoardUsecase)
    private readonly createBoardUsecase: CreateBoardUsecase,
    @Inject(PresenterSymbols.Board.CreateBoardPresenter)
    private readonly createBoardPresenter: CreateBoardPresenter,

    // @Inject(UsecaseSymbols.Board.FindBoardByIdUsecase)
    // private readonly findBoardByIdUsecase: FindBoardByIdUsecase,
    // @Inject(PresenterSymbols.Board.FindBoardByIdPresenter)
    // private readonly findBoardByIdPresenter: FindBoardByIdPresenter,

    // @Inject(UsecaseSymbols.Board.GetBoardsUsecase)
    // private readonly getBoardsUsecase: GetBoardsUsecase,
    // @Inject(PresenterSymbols.Board.GetBoardsPresenter)
    // private readonly getBoardsPresenter: GetBoardsPresenter,

    // @Inject(UsecaseSymbols.Board.UpdateBoardUsecase)
    // private readonly updateBoardUsecase: UpdateBoardUsecase,
    // @Inject(PresenterSymbols.Board.UpdateBoardPresenter)
    // private readonly updateBoardPresenter: CreateBoardPresenter,

    // @Inject(UsecaseSymbols.Board.DeleteBoardUsecase)
    // private readonly deleteBoardUsecase: DeleteBoardUsecase,
  ) {}

  @Post()
  // @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  // @Permissions(PermissionCode.BOARD_CREATE)
  async create(@Res() res: Response, @Body() dto: CreateBoardDto) {
    try {
      const board = await this.createBoardUsecase.execute({
        projectId: dto.projectId,
        name: dto.name,
        description: dto.description,
      });

      res.status(HttpStatus.CREATED).send({
        status: HttpStatus.CREATED,
        data: this.createBoardPresenter.present(board),
      });
    } catch (error) {
      res.status(error.statusCode).send({
        status: error.statusCode || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message,
      });
    }
  }

  //   @Get()
  //   @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  //   @Boards(BoardCode.Board_GET)
  //   async getAll(@Res() res: Response, @Query() query: GetBoardsQuery) {
  //     try {
  //       const Boards = await this.getBoardsUsecase.execute({
  //         page: query.page ? Number(query.page) : undefined,
  //         limit: query.limit ? Number(query.limit) : undefined,
  //         name: query.name,
  //       });

  //       res.status(HttpStatus.OK).send({
  //         status: HttpStatus.OK,
  //         data: this.getBoardsPresenter.present(Boards.data),
  //         filter: query,
  //         totalCount: Boards.totalCount,
  //         page: Boards.page,
  //         limit: Boards.limit,
  //       });
  //     } catch (error) {
  //       res.status(error.statusCode).send({
  //         status: error.statusCode || HttpStatus.BAD_REQUEST,
  //         success: false,
  //         message: error.message,
  //       });
  //     }
  //   }

  //   @Get(':id')
  //   @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  //   @Boards(BoardCode.Board_GET)
  //   async findById(@Res() res: Response, @Param('id') id: string) {
  //     try {
  //       const Board = await this.findBoardByIdUsecase.execute({ id });

  //       res.status(HttpStatus.OK).send({
  //         status: HttpStatus.OK,
  //         data: this.findBoardByIdPresenter.present(Board),
  //       });
  //     } catch (error) {
  //       res.status(error.statusCode).send({
  //         status: error.statusCode || HttpStatus.BAD_REQUEST,
  //         success: false,
  //         message: error.message,
  //       });
  //     }
  //   }

  //   @Put(':id')
  //   @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  //   @Boards(BoardCode.Board_EDIT)
  //   async update(
  //     @Res() res: Response,
  //     @Param('id') id: string,
  //     @Body() dto: CreateBoardDto,
  //   ) {
  //     try {
  //       const Board = await this.updateBoardUsecase.execute({
  //         id: id,
  //         code: dto.code,
  //         status: dto.status,
  //       });
  //       res.status(HttpStatus.OK).send({
  //         status: HttpStatus.OK,
  //         data: this.updateBoardPresenter.present(Board),
  //       });
  //     } catch (error) {
  //       res.status(error.statusCode).send({
  //         status: error.statusCode || HttpStatus.BAD_REQUEST,
  //         success: false,
  //         message: error.message,
  //       });
  //     }
  //   }

  //   @Delete(':id')
  //   @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN)
  //   @Boards(BoardCode.Board_DELETE)
  //   async delete(@Res() res: Response, @Param('id') id: string) {
  //     try {
  //       const deletedId = await this.deleteBoardUsecase.execute({ id });
  //       res.status(HttpStatus.OK).send({
  //         status: HttpStatus.OK,
  //         data: { id: deletedId },
  //       });
  //     } catch (error) {
  //       res.status(error.statusCode).send({
  //         status: error.statusCode || HttpStatus.BAD_REQUEST,
  //         success: false,
  //         message: error.message,
  //       });
  //     }
  //   }
}
