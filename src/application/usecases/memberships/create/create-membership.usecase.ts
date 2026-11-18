import { Inject } from '@nestjs/common';
import { Membership, MembershipRepository } from 'src/domain';
import { NotificationType } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { SendNotificationUsecase } from '../../notifications/send';
import {
  CreateMembershipUsecase,
  CreateMembershipUsecaseParams,
} from './types';

export class CreateMembershipUsecaseImpl implements CreateMembershipUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,

    @Inject(UsecaseSymbols.Notification.SendNotificationUsecase)
    private readonly sendNotificationUsecase: SendNotificationUsecase,
  ) {}

  async execute(params: CreateMembershipUsecaseParams): Promise<Membership> {
    const membership = await this.membershipRepository.create({
      userId: params.userId,
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      roleId: params.roleId,
      override: params.override ?? false,
    });

    await this.notifyAddedUser(membership, params.actorId);

    return membership;
  }

  /** Best effort: a failure here never fails the membership request. */
  private async notifyAddedUser(
    membership: Membership,
    actorId?: string,
  ): Promise<void> {
    if (membership.userId === actorId) {
      return;
    }

    const { scopeType, scopeId } = membership;
    const scopeName = await this.membershipRepository
      .findScopeName(scopeType, scopeId)
      .catch(() => null);

    await this.sendNotificationUsecase.execute({
      recipientId: membership.userId,
      actorId,
      type: NotificationType.MEMBERSHIP_ADDED,
      title: `Added to a ${scopeType}`,
      message: scopeName
        ? `You were added to the ${scopeType} "${scopeName}".`
        : `You were added to a ${scopeType}.`,
      data: {
        membershipId: membership.id,
        scopeType,
        scopeId,
        [`${scopeType}Id`]: scopeId,
      },
    });
  }
}
