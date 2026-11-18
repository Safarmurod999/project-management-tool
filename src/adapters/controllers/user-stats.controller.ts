import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GetMyCardStatsUsecase } from 'src/application';
import { RoleCode } from 'src/infrastructure/common/enum';
import { Roles } from 'src/infrastructure/decorators';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import { GetMyCardStatsPresenter } from '../presenters';
import { sendError } from './error-response';

export class GetMyStatsQuery {
  projectId?: string;
}

/**
 * `GET /users/me/stats` is served from the cards module because it reads
 * cards; UserModule cannot import CardsModule without a module cycle.
 * `users/:id` never matches it, since that route has a single segment.
 */
@Controller('users')
@UseGuards(RolesPermissionsGuard)
export class UserStatsController {
  constructor(
    @Inject(UsecaseSymbols.Card.GetMyCardStatsUsecase)
    private readonly getMyCardStatsUsecase: GetMyCardStatsUsecase,
    @Inject(PresenterSymbols.Card.GetMyCardStatsPresenter)
    private readonly getMyCardStatsPresenter: GetMyCardStatsPresenter,
  ) {}

  @Get('me/stats')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  async getMyStats(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetMyStatsQuery,
  ) {
    try {
      const stats = await this.getMyCardStatsUsecase.execute({
        userId: req.user!.id,
        projectId: query.projectId,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getMyCardStatsPresenter.present(stats),
      });
    } catch (error) {
      sendError(res, error);
    }
  }
}
