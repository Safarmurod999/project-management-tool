import { Inject } from '@nestjs/common';
import {
  BoardRepository,
  Card,
  ColumnRepository,
  NotificationData,
  StatusRepository,
} from 'src/domain';
import { NotificationType } from 'src/infrastructure/common/enum';
import { CommonSymbols } from 'src/infrastructure/dependency-injection/common/symbol';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { Logger } from 'src/infrastructure/logger';
import { SendNotificationUsecase } from '../../notifications/send';
import {
  NotifyCardChangeUsecase,
  NotifyCardChangeUsecaseParams,
} from './types';

export class NotifyCardChangeUsecaseImpl implements NotifyCardChangeUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,
    @Inject(UsecaseSymbols.Notification.SendNotificationUsecase)
    private readonly sendNotificationUsecase: SendNotificationUsecase,
    @Inject(CommonSymbols.Logger)
    private readonly logger: Logger,
  ) {}

  async execute({
    before,
    after,
    actorId,
  }: NotifyCardChangeUsecaseParams): Promise<void> {
    const assignee = after.assigneeId;
    const newAssignee =
      assignee && assignee !== (before?.assigneeId ?? null) ? assignee : null;
    // A new assignee already hears about the card through `card_assigned`.
    const statusRecipient =
      before && before.statusId !== after.statusId && assignee !== newAssignee
        ? assignee
        : null;

    const notifyAssigned = !!newAssignee && newAssignee !== actorId;
    const notifyStatus = !!statusRecipient && statusRecipient !== actorId;

    if (!notifyAssigned && !notifyStatus) {
      return;
    }

    try {
      const data = await this.cardData(after);

      if (notifyAssigned) {
        await this.sendNotificationUsecase.execute({
          recipientId: newAssignee,
          actorId,
          type: NotificationType.CARD_ASSIGNED,
          title: 'New card assigned',
          message: `You were assigned to "${after.title}".`,
          data,
        });
      }

      if (notifyStatus && before) {
        const statuses = await this.statusRepository.findByIds([
          before.statusId,
          after.statusId,
        ]);
        const nameOf = (id: string) =>
          statuses.find((status) => status.id === id)?.name ?? 'another status';

        await this.sendNotificationUsecase.execute({
          recipientId: statusRecipient,
          actorId,
          type: NotificationType.CARD_STATUS_CHANGED,
          title: 'Card status changed',
          message: `"${after.title}" moved from ${nameOf(before.statusId)} to ${nameOf(after.statusId)}.`,
          data: {
            ...data,
            fromStatusId: before.statusId,
            toStatusId: after.statusId,
          },
        });
      }
    } catch (error) {
      this.logger.error('Failed to send card notifications', {
        cardId: after.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async cardData(card: Card): Promise<NotificationData> {
    const column = await this.columnRepository.findById(card.columnId);
    const board = await this.boardRepository.findById(column.boardId);

    return {
      cardId: card.id,
      columnId: card.columnId,
      boardId: board.id,
      projectId: board.projectId,
    };
  }
}
