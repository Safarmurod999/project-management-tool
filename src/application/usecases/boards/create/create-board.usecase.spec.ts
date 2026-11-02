import {
  Board,
  BoardRepository,
  Column,
  ColumnRepository,
  ColumnStatus,
  ColumnStatusRepository,
  DEFAULT_STATUSES,
  ProjectRepository,
  Status,
  StatusRepository,
} from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { CreateBoardUsecaseImpl } from './create-board.usecase';

describe('CreateBoardUsecaseImpl (default initialization)', () => {
  const projectStatuses = DEFAULT_STATUSES.map(
    (s) =>
      new Status(
        `s-${s.code}`,
        'p1',
        s.name,
        s.code,
        s.color,
        s.order,
        s.isDefault,
        1,
        new Date(),
      ),
  );

  let statusRepository: jest.Mocked<StatusRepository>;
  let columnRepository: jest.Mocked<ColumnRepository>;
  let columnStatusRepository: jest.Mocked<ColumnStatusRepository>;
  let transactionManager: jest.Mocked<TransactionManager>;
  let socket: jest.Mocked<RealtimeService>;
  let usecase: CreateBoardUsecaseImpl;

  beforeEach(() => {
    statusRepository = {
      findByProjectId: jest.fn().mockResolvedValue(projectStatuses),
      createMany: jest.fn().mockResolvedValue(projectStatuses),
    } as unknown as jest.Mocked<StatusRepository>;
    columnRepository = {
      create: jest.fn(
        async (c) =>
          new Column(
            `col-${c.name}`,
            c.boardId,
            c.name,
            c.order,
            1,
            new Date(),
          ),
      ),
    } as unknown as jest.Mocked<ColumnRepository>;
    columnStatusRepository = {
      create: jest.fn(
        async (m) =>
          new ColumnStatus('m', m.columnId, m.statusId, m.order!, new Date()),
      ),
    } as unknown as jest.Mocked<ColumnStatusRepository>;
    transactionManager = {
      run: jest.fn((work) => work()),
    } as unknown as jest.Mocked<TransactionManager>;
    socket = {
      emitToRoom: jest.fn(),
      emitToUser: jest.fn(),
      broadcast: jest.fn(),
    };

    usecase = new CreateBoardUsecaseImpl(
      { info: jest.fn() } as any,
      {
        create: jest.fn(
          async (b) =>
            new Board(
              'b1',
              b.projectId,
              b.name,
              b.description,
              BoardStatus.ACTIVE,
              1,
              new Date(),
            ),
        ),
      } as unknown as BoardRepository,
      {
        findById: jest.fn().mockResolvedValue({ id: 'p1' }),
      } as unknown as ProjectRepository,
      statusRepository,
      columnRepository,
      columnStatusRepository,
      transactionManager,
      socket,
    );
  });

  it('creates the default columns mapped to the existing project statuses', async () => {
    await usecase.execute({ projectId: 'p1', name: 'Board', description: '' });

    expect(statusRepository.createMany).not.toHaveBeenCalled();
    expect(
      columnRepository.create.mock.calls.map(([c]) => [c.name, c.order]),
    ).toEqual([
      ['To Do', 0],
      ['In Progress', 1],
      ['Done', 2],
    ]);

    const layout: Record<string, string[]> = {};
    for (const [mapping] of columnStatusRepository.create.mock.calls) {
      (layout[mapping.columnId] ??= [])[mapping.order!] =
        mapping.statusId.replace('s-', '');
    }
    expect(layout).toEqual({
      'col-To Do': ['planning', 'todo'],
      'col-In Progress': ['in_progress', 'pending', 'testing', 'to_realize'],
      'col-Done': ['rejected', 'done'],
    });
    expect(transactionManager.run).toHaveBeenCalledTimes(1);
    expect(socket.emitToRoom).toHaveBeenCalledWith(
      'project:p1',
      'board:created',
      expect.any(Board),
    );
  });

  it('seeds default statuses only for projects that have none', async () => {
    statusRepository.findByProjectId.mockResolvedValueOnce([]);

    await usecase.execute({ projectId: 'p1', name: 'Board', description: '' });

    expect(statusRepository.createMany).toHaveBeenCalledTimes(1);
    expect(statusRepository.createMany.mock.calls[0][0]).toHaveLength(
      DEFAULT_STATUSES.length,
    );
  });

  it('skips default codes the project no longer has instead of recreating them', async () => {
    statusRepository.findByProjectId.mockResolvedValueOnce(
      projectStatuses.filter((s) => s.code !== 'pending'),
    );

    await usecase.execute({ projectId: 'p1', name: 'Board', description: '' });

    expect(statusRepository.createMany).not.toHaveBeenCalled();
    expect(
      columnStatusRepository.create.mock.calls.map(([m]) => m.statusId),
    ).not.toContain('s-pending');
  });
});
