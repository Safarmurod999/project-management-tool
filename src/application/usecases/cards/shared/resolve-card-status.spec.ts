import {
  Board,
  BoardRepository,
  Column,
  ColumnRepository,
  ColumnStatus,
  ColumnStatusRepository,
  Status,
  StatusRepository,
} from 'src/domain';
import { BoardStatus } from 'src/infrastructure/common/enum';
import {
  CardStatusResolverDeps,
  resolveCardStatusId,
} from './resolve-card-status';

const status = (id: string, isDefault = false, projectId = 'p1') =>
  new Status(id, projectId, id, id, '#000000', 0, isDefault, 1, new Date());

describe('resolveCardStatusId', () => {
  let deps: CardStatusResolverDeps;
  let statuses: Record<string, Status>;
  let mappings: ColumnStatus[];

  beforeEach(() => {
    statuses = {
      todo: status('todo', true),
      planning: status('planning'),
      done: status('done'),
      foreign: status('foreign', false, 'p2'),
    };
    // Column "col-todo" holds planning then todo; "col-done" holds done.
    mappings = [
      new ColumnStatus('m1', 'col-todo', 'planning', 0, new Date()),
      new ColumnStatus('m2', 'col-todo', 'todo', 1, new Date()),
      new ColumnStatus('m3', 'col-done', 'done', 0, new Date()),
    ];

    deps = {
      columnRepository: {
        findById: jest.fn(
          async (id: string) => new Column(id, 'b1', id, 0, 1, new Date()),
        ),
      } as unknown as ColumnRepository,
      boardRepository: {
        findById: jest.fn(
          async (id: string) =>
            new Board(id, 'p1', 'B', null, BoardStatus.ACTIVE, 1, new Date()),
        ),
      } as unknown as BoardRepository,
      statusRepository: {
        findById: jest.fn(async (id: string) => statuses[id]),
        findByIds: jest.fn(async (ids: string[]) =>
          ids.map((id) => statuses[id]),
        ),
      } as unknown as StatusRepository,
      columnStatusRepository: {
        findByColumnId: jest.fn(async (columnId: string) =>
          mappings.filter((m) => m.columnId === columnId),
        ),
      } as unknown as ColumnStatusRepository,
    };
  });

  it('accepts a requested status mapped to the column', async () => {
    await expect(
      resolveCardStatusId(deps, {
        columnId: 'col-todo',
        requestedStatusId: 'planning',
      }),
    ).resolves.toBe('planning');
  });

  it('rejects a requested status mapped to another column', async () => {
    await expect(
      resolveCardStatusId(deps, {
        columnId: 'col-todo',
        requestedStatusId: 'done',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('not mapped'),
    });
  });

  it('rejects a status from another project', async () => {
    await expect(
      resolveCardStatusId(deps, {
        columnId: 'col-todo',
        requestedStatusId: 'foreign',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('does not belong'),
    });
  });

  it('keeps the current status when the target column contains it', async () => {
    await expect(
      resolveCardStatusId(deps, {
        columnId: 'col-todo',
        currentStatusId: 'planning',
      }),
    ).resolves.toBe('planning');
  });

  it('prefers the project default status, then the first mapped status', async () => {
    await expect(
      resolveCardStatusId(deps, { columnId: 'col-todo' }),
    ).resolves.toBe('todo');
    await expect(
      resolveCardStatusId(deps, {
        columnId: 'col-done',
        currentStatusId: 'todo',
      }),
    ).resolves.toBe('done');
  });

  it('fails when the column has no statuses', async () => {
    await expect(
      resolveCardStatusId(deps, { columnId: 'col-empty' }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});
