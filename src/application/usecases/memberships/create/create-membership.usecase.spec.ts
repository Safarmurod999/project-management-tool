import {
  Membership,
  MembershipCreateParams,
  MembershipRepository,
} from 'src/domain';
import { NotificationType, ScopeType } from 'src/infrastructure/common/enum';
import { SendNotificationUsecase } from '../../notifications/send';
import { CreateMembershipUsecaseImpl } from './create-membership.usecase';

describe('CreateMembershipUsecaseImpl', () => {
  let create: jest.Mock;
  let findScopeName: jest.Mock;
  let send: jest.Mock;
  let usecase: CreateMembershipUsecaseImpl;

  const params = {
    userId: 'user-2',
    scopeType: ScopeType.PROJECT,
    scopeId: 'p1',
    roleId: 'r1',
    actorId: 'admin',
  };

  beforeEach(() => {
    create = jest.fn((data: MembershipCreateParams) =>
      Promise.resolve(
        new Membership(
          'm1',
          data.userId,
          data.scopeType,
          data.scopeId,
          data.roleId,
          false,
          new Date(),
        ),
      ),
    );
    findScopeName = jest.fn().mockResolvedValue('New Website');
    send = jest.fn().mockResolvedValue(null);
    usecase = new CreateMembershipUsecaseImpl(
      { create, findScopeName } as unknown as MembershipRepository,
      { execute: send } as unknown as SendNotificationUsecase,
    );
  });

  it('notifies the added user after the membership is saved', async () => {
    const membership = await usecase.execute(params);

    expect(membership.id).toBe('m1');
    expect(findScopeName).toHaveBeenCalledWith(ScopeType.PROJECT, 'p1');
    expect(send).toHaveBeenCalledWith({
      recipientId: 'user-2',
      actorId: 'admin',
      type: NotificationType.MEMBERSHIP_ADDED,
      title: 'Added to a project',
      message: 'You were added to the project "New Website".',
      data: {
        membershipId: 'm1',
        scopeType: 'project',
        scopeId: 'p1',
        projectId: 'p1',
      },
    });
  });

  it('does not notify users who add themselves', async () => {
    await usecase.execute({ ...params, actorId: 'user-2' });

    expect(send).not.toHaveBeenCalled();
  });

  it('still succeeds when the scope name cannot be read', async () => {
    findScopeName.mockRejectedValueOnce(new Error('x'));

    await expect(usecase.execute(params)).resolves.toBeInstanceOf(Membership);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'You were added to a project.' }),
    );
  });

  it('does not notify when the membership could not be saved', async () => {
    create.mockRejectedValueOnce(new Error('duplicate'));

    await expect(usecase.execute(params)).rejects.toThrow('duplicate');
    expect(send).not.toHaveBeenCalled();
  });
});
