import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  GetNotificationsUsecase,
  MarkAllNotificationsReadUsecase,
  MarkNotificationReadUsecase,
} from 'src/application';
import { NotificationException } from 'src/domain';
import { RoleCode } from 'src/infrastructure/common/enum';
import { Roles } from 'src/infrastructure/decorators';
import { PresenterSymbols } from 'src/infrastructure/dependency-injection/presenters/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { RolesPermissionsGuard } from 'src/infrastructure/middlewares/role-guard.middleware';
import {
  GetNotificationsPresenter,
  NotificationPresenter,
} from '../presenters';
import { sendError } from './error-response';
import { parseBooleanQuery, parseNumberQuery } from './query-params';

export class GetNotificationsQuery {
  page?: string;
  limit?: string;
  unread?: string;
}

/**
 * The authenticated user's own notifications. Every role may call these
 * endpoints; the user always comes from the access token.
 */
@Controller('notifications')
@UseGuards(RolesPermissionsGuard)
export class NotificationController {
  constructor(
    @Inject(UsecaseSymbols.Notification.GetNotificationsUsecase)
    private readonly getNotificationsUsecase: GetNotificationsUsecase,
    @Inject(UsecaseSymbols.Notification.MarkNotificationReadUsecase)
    private readonly markNotificationReadUsecase: MarkNotificationReadUsecase,
    @Inject(UsecaseSymbols.Notification.MarkAllNotificationsReadUsecase)
    private readonly markAllNotificationsReadUsecase: MarkAllNotificationsReadUsecase,
    @Inject(PresenterSymbols.Notification.NotificationPresenter)
    private readonly notificationPresenter: NotificationPresenter,
    @Inject(PresenterSymbols.Notification.GetNotificationsPresenter)
    private readonly getNotificationsPresenter: GetNotificationsPresenter,
  ) {}

  @Get()
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  async getAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetNotificationsQuery,
  ) {
    try {
      const unread = parseBooleanQuery(query.unread);
      if (unread === null) {
        throw NotificationException.InvalidUnreadFilter(query.unread!);
      }

      const notifications = await this.getNotificationsUsecase.execute({
        userId: req.user!.id,
        page: parseNumberQuery(query.page),
        limit: parseNumberQuery(query.limit),
        unread,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.getNotificationsPresenter.present(notifications.data),
        totalCount: notifications.totalCount,
        page: notifications.page,
        limit: notifications.limit,
        unreadCount: notifications.unreadCount,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  // Registered before `:id/read`; the paths differ in length, so the order is
  // only for readability.
  @Patch('read-all')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  async markAllAsRead(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.markAllNotificationsReadUsecase.execute({
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: result,
      });
    } catch (error) {
      sendError(res, error);
    }
  }

  @Patch(':id/read')
  @Roles(RoleCode.SUPER_ADMIN, RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.USER)
  async markAsRead(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    try {
      const notification = await this.markNotificationReadUsecase.execute({
        id,
        userId: req.user!.id,
      });

      res.status(HttpStatus.OK).send({
        status: HttpStatus.OK,
        data: this.notificationPresenter.present(notification),
      });
    } catch (error) {
      sendError(res, error);
    }
  }
}
