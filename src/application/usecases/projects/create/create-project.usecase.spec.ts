import {
  DEFAULT_STATUSES,
  MembershipRepository,
  ProjectRepository,
  StatusRepository,
} from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { CreateProjectUsecaseImpl } from './create-project.usecase';

describe('CreateProjectUsecaseImpl (default statuses)', () => {
  it('creates project, membership and default statuses in one transaction', async () => {
    const order: string[] = [];
    const projectRepository = {
      create: jest.fn(async () => {
        order.push('project');
        return { id: 'p1' };
      }),
    } as unknown as ProjectRepository;
    const membershipRepository = {
      create: jest.fn(async () => {
        order.push('membership');
      }),
    } as unknown as MembershipRepository;
    const statusRepository = {
      createMany: jest.fn(async () => {
        order.push('statuses');
        return [];
      }),
    } as unknown as jest.Mocked<StatusRepository>;
    const transactionManager: TransactionManager = {
      run: jest.fn(async (work) => {
        order.push('begin');
        const result = await work();
        order.push('commit');
        return result;
      }),
    };
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const usecase = new CreateProjectUsecaseImpl(
      projectRepository,
      membershipRepository,
      statusRepository,
      transactionManager,
    );
    await usecase.execute({
      name: 'P',
      description: null,
      teamId: 't1',
      userId: 'u1',
      roleId: 'r1',
    });

    expect(order).toEqual([
      'begin',
      'project',
      'membership',
      'statuses',
      'commit',
    ]);
    const created = statusRepository.createMany.mock.calls[0][0];
    expect(created.map((s) => s.code)).toEqual(
      DEFAULT_STATUSES.map((s) => s.code),
    );
    expect(created.every((s) => s.projectId === 'p1')).toBe(true);
    expect(created.filter((s) => s.isDefault).map((s) => s.code)).toEqual([
      'todo',
    ]);
  });
});
