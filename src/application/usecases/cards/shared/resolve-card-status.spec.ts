import {
  Board,
  BoardRepository,
  Column,
  ColumnRepository,
  ColumnStatus,
  ColumnStatusRepository,
  Status,
  StatusRepository,
  Workflow,
  WorkflowRepository,
  WorkflowStatus,
  WorkflowStatusRepository,
  WorkflowTransition,
  WorkflowTransitionRepository,
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
  let workflow: Workflow | null;
  let workflowStatusIds: string[];
  let rules: Array<[string, string]>;

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

    workflow = null;
    workflowStatusIds = [];
    rules = [];

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
      workflowRepository: {
        findDefaultByProjectId: jest.fn(async () => workflow),
      } as unknown as WorkflowRepository,
      workflowStatusRepository: {
        exists: jest.fn(async (_w: string, statusId: string) =>
          workflowStatusIds.includes(statusId),
        ),
        findByWorkflowId: jest.fn(async (workflowId: string) =>
          workflowStatusIds.map(
            (statusId) =>
              new WorkflowStatus(statusId, workflowId, statusId, new Date()),
          ),
        ),
      } as unknown as WorkflowStatusRepository,
      workflowTransitionRepository: {
        exists: jest.fn(async (_w: string, from: string, to: string) =>
          rules.some(([a, b]) => a === from && b === to),
        ),
        findFrom: jest.fn(async (workflowId: string, from: string) =>
          rules
            .filter(([a]) => a === from)
            .map(
              ([a, b]) =>
                new WorkflowTransition(a + '-' + b, workflowId, a, b, new Date()),
            ),
        ),
      } as unknown as WorkflowTransitionRepository,
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

  describe('with a project workflow', () => {
    beforeEach(() => {
      workflow = new Workflow('w1', 'p1', 'Flow', null, true, 1, new Date());
      workflowStatusIds = ['planning', 'todo', 'done'];
      rules = [
        ['planning', 'todo'],
        ['todo', 'done'],
      ];
    });

    it('allows a change that has a transition rule', async () => {
      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-done',
          requestedStatusId: 'done',
          currentStatusId: 'todo',
        }),
      ).resolves.toBe('done');
    });

    it('rejects a change without a transition rule', async () => {
      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-done',
          requestedStatusId: 'done',
          currentStatusId: 'planning',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('not allowed'),
      });
    });

    it('treats rules as one-way', async () => {
      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-todo',
          requestedStatusId: 'todo',
          currentStatusId: 'done',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('rejects a status that is not part of the workflow', async () => {
      workflowStatusIds = ['todo', 'done'];

      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-todo',
          requestedStatusId: 'planning',
        }),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('not part of workflow'),
      });
    });

    it('does not need a rule when the status stays the same', async () => {
      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-todo',
          requestedStatusId: 'todo',
          currentStatusId: 'todo',
        }),
      ).resolves.toBe('todo');
    });

    it('picks only reachable statuses on a column move', async () => {
      // From planning only todo is reachable; col-done holds only done.
      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-done',
          currentStatusId: 'planning',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
      await expect(
        resolveCardStatusId(deps, {
          columnId: 'col-done',
          currentStatusId: 'todo',
        }),
      ).resolves.toBe('done');
    });

    it('creates cards only in statuses of the workflow', async () => {
      workflowStatusIds = ['planning', 'done'];

      // todo is the project default but not in the workflow.
      await expect(
        resolveCardStatusId(deps, { columnId: 'col-todo' }),
      ).resolves.toBe('planning');
    });
  });

  it('fails when the column has no statuses', async () => {
    await expect(
      resolveCardStatusId(deps, { columnId: 'col-empty' }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});
