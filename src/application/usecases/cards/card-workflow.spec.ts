import {
  Board,
  BoardRepository,
  Card,
  CardException,
  CardRepository,
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
import { TransactionManager } from 'src/application/services';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { UpdateCardUsecaseImpl } from './update';
import { ReorderCardUsecaseImpl } from './reorder';

/**
 * Workflow enforcement on the existing card status update (PUT /cards/:id) and
 * move (PATCH /cards/reorder) operations, against in-memory repositories.
 *
 * Board b1 (project p1): col-todo [todo], col-progress [in_progress, testing],
 * col-done [done]. Workflow rules: todo -> in_progress -> testing -> done.
 */
describe('Card status changes under a project workflow', () => {
  const status = (id: string, projectId = 'p1', isDefault = false) =>
    new Status(id, projectId, id, id, '#000000', 0, isDefault, 1, new Date());
  const statuses: Record<string, Status> = {
    todo: status('todo', 'p1', true),
    in_progress: status('in_progress'),
    testing: status('testing'),
    done: status('done'),
    foreign: status('foreign', 'p2'),
  };
  const mappings = [
    new ColumnStatus('m1', 'col-todo', 'todo', 0, new Date()),
    new ColumnStatus('m2', 'col-progress', 'in_progress', 0, new Date()),
    new ColumnStatus('m3', 'col-progress', 'testing', 1, new Date()),
    new ColumnStatus('m4', 'col-done', 'done', 0, new Date()),
  ];

  let workflow: Workflow | null;
  let workflowStatusIds: string[];
  let rules: Array<[string, string]>;
  /** Status persisted in the database; differs from `readStatusId` after a concurrent change. */
  let storedStatusId: string;
  let readStatusId: string;
  let cardRepository: jest.Mocked<CardRepository>;
  let transactionManager: jest.Mocked<TransactionManager>;
  let update: UpdateCardUsecaseImpl;
  let reorder: ReorderCardUsecaseImpl;

  const assertStored = (expectedStatusId?: string) => {
    if (expectedStatusId && expectedStatusId !== storedStatusId) {
      throw CardException.CurrentStatusMismatch('card-1', expectedStatusId);
    }
  };

  beforeEach(() => {
    workflow = new Workflow('w1', 'p1', 'Flow', null, true, 1, new Date());
    workflowStatusIds = ['todo', 'in_progress', 'testing', 'done', 'foreign'];
    rules = [
      ['todo', 'in_progress'],
      ['in_progress', 'testing'],
      ['testing', 'done'],
      // Even with a rule, a status of another project is refused.
      ['todo', 'foreign'],
    ];
    storedStatusId = 'todo';
    readStatusId = 'todo';

    cardRepository = {
      findById: jest.fn(
        async (id: string) =>
          new Card(id, 'col-todo', 'Card', null, 0, readStatusId),
      ),
      find: jest.fn(async () => ({
        data: [],
        page: 1,
        limit: 1,
        totalCount: 0,
      })),
      update: jest.fn(async (params) => {
        assertStored(params.expectedStatusId);
        return new Card(
          params.id,
          params.columnId ?? 'col-todo',
          'Card',
          null,
          0,
          params.statusId ?? storedStatusId,
        );
      }),
      reorder: jest.fn(async (params) => {
        assertStored(params.expectedStatusId);
        return new Card(
          params.cardId,
          params.targetColumnId,
          'Card',
          null,
          params.newIndex,
          params.statusId ?? storedStatusId,
        );
      }),
    } as unknown as jest.Mocked<CardRepository>;
    transactionManager = {
      run: jest.fn((work) => work()),
    } as unknown as jest.Mocked<TransactionManager>;

    const deps = [
      {
        findById: jest.fn(
          async (id: string) => new Column(id, 'b1', id, 0, 1, new Date()),
        ),
      } as unknown as ColumnRepository,
      {
        findById: jest.fn(
          async () =>
            new Board('b1', 'p1', 'B', null, BoardStatus.ACTIVE, 1, new Date()),
        ),
      } as unknown as BoardRepository,
      {
        findById: jest.fn(async (id: string) => statuses[id]),
        findByIds: jest.fn(async (ids: string[]) =>
          ids.map((id) => statuses[id]),
        ),
      } as unknown as StatusRepository,
      {
        findByColumnId: jest.fn(async (columnId: string) =>
          mappings.filter((item) => item.columnId === columnId),
        ),
      } as unknown as ColumnStatusRepository,
      {
        findDefaultByProjectId: jest.fn(async () => workflow),
      } as unknown as WorkflowRepository,
      {
        exists: jest.fn(async (_w: string, statusId: string) =>
          workflowStatusIds.includes(statusId),
        ),
        findByWorkflowId: jest.fn(async (workflowId: string) =>
          workflowStatusIds.map(
            (id) => new WorkflowStatus(id, workflowId, id, new Date()),
          ),
        ),
      } as unknown as WorkflowStatusRepository,
      {
        exists: jest.fn(async (_w: string, from: string, to: string) =>
          rules.some(([a, b]) => a === from && b === to),
        ),
        findFrom: jest.fn(async (workflowId: string, from: string) =>
          rules
            .filter(([a]) => a === from)
            .map(
              ([a, b]) =>
                new WorkflowTransition(
                  `${a}-${b}`,
                  workflowId,
                  a,
                  b,
                  new Date(),
                ),
            ),
        ),
      } as unknown as WorkflowTransitionRepository,
    ] as const;

    update = new UpdateCardUsecaseImpl(
      cardRepository,
      ...deps,
      transactionManager,
    );
    reorder = new ReorderCardUsecaseImpl(
      cardRepository,
      ...deps,
      transactionManager,
    );
  });

  const changeStatus = (statusId: string, columnId?: string) =>
    update.execute({ id: 'card-1', statusId, columnId });
  const move = (targetColumnId: string, statusId?: string) =>
    reorder.execute({
      cardId: 'card-1',
      sourceColumnId: 'col-todo',
      targetColumnId,
      newIndex: 0,
      statusId,
    });

  describe('valid transitions', () => {
    it('updates the status when a rule exists', async () => {
      await expect(
        changeStatus('in_progress', 'col-progress'),
      ).resolves.toMatchObject({ statusId: 'in_progress' });
      expect(transactionManager.run).toHaveBeenCalledTimes(1);
      expect(cardRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          statusId: 'in_progress',
          expectedStatusId: 'todo',
        }),
      );
    });

    it('moves the card when a rule exists', async () => {
      await expect(move('col-progress', 'in_progress')).resolves.toMatchObject({
        columnId: 'col-progress',
        statusId: 'in_progress',
      });
      expect(transactionManager.run).toHaveBeenCalledTimes(1);
    });

    it('picks a reachable status of the target column when none is given', async () => {
      await expect(move('col-progress')).resolves.toMatchObject({
        statusId: 'in_progress',
      });
    });

    it('does not need a rule or a status guard when the status is unchanged', async () => {
      await update.execute({ id: 'card-1', title: 'Renamed' });
      await changeStatus('todo');

      expect(cardRepository.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          statusId: 'todo',
          expectedStatusId: undefined,
        }),
      );
    });
  });

  describe('missing transitions', () => {
    it('rejects a status update without a rule', async () => {
      await expect(changeStatus('done', 'col-done')).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('not allowed by its workflow'),
      });
      expect(cardRepository.update).not.toHaveBeenCalled();
    });

    it('rejects a move without a rule', async () => {
      await expect(move('col-done', 'done')).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(cardRepository.reorder).not.toHaveBeenCalled();
    });

    it('rejects a move to a column with no reachable status', async () => {
      await expect(move('col-done')).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('can be reached'),
      });
    });

    it('rejects a status that is not part of the workflow', async () => {
      workflowStatusIds = ['todo', 'testing', 'done'];

      await expect(
        changeStatus('in_progress', 'col-progress'),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('not part of workflow'),
      });
    });
  });

  describe('one-way transitions', () => {
    beforeEach(() => {
      storedStatusId = 'in_progress';
      readStatusId = 'in_progress';
      cardRepository.findById.mockImplementation(
        async (id: string) =>
          new Card(id, 'col-progress', 'Card', null, 0, 'in_progress'),
      );
    });

    it('allows the forward direction', async () => {
      await expect(changeStatus('testing')).resolves.toMatchObject({
        statusId: 'testing',
      });
    });

    it('rejects the reverse direction of a one-way rule', async () => {
      await expect(changeStatus('todo', 'col-todo')).rejects.toMatchObject({
        statusCode: 409,
      });
      await expect(
        reorder.execute({
          cardId: 'card-1',
          sourceColumnId: 'col-progress',
          targetColumnId: 'col-todo',
          newIndex: 0,
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('allows the reverse direction once it is added as its own rule', async () => {
      rules.push(['in_progress', 'todo']);

      await expect(changeStatus('todo', 'col-todo')).resolves.toMatchObject({
        statusId: 'todo',
      });
    });
  });

  describe('incorrect current status', () => {
    it('refuses an update when the card left the status it was validated from', async () => {
      // Read as todo (todo -> in_progress allowed) but already in testing in the database.
      storedStatusId = 'testing';

      await expect(
        changeStatus('in_progress', 'col-progress'),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining('no longer in status todo'),
      });
    });

    it('refuses a move when the card left the status it was validated from', async () => {
      storedStatusId = 'testing';

      await expect(
        reorder.execute({
          cardId: 'card-1',
          sourceColumnId: 'col-todo',
          targetColumnId: 'col-progress',
          newIndex: 0,
          statusId: 'in_progress',
          expectedStatusId: 'todo',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('cross-project statuses', () => {
    it('rejects a status of another project even if a rule mentions it', async () => {
      await expect(changeStatus('foreign')).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('does not belong to project p1'),
      });
      await expect(move('col-todo', 'foreign')).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(cardRepository.update).not.toHaveBeenCalled();
      expect(cardRepository.reorder).not.toHaveBeenCalled();
    });
  });

  describe('column status mapping is still enforced', () => {
    it('rejects an allowed status that is not mapped to the target column', async () => {
      // todo -> in_progress is allowed, but in_progress lives in col-progress.
      await expect(
        changeStatus('in_progress', 'col-done'),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('not mapped to column col-done'),
      });
      await expect(move('col-done', 'in_progress')).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe('without a project workflow', () => {
    it('keeps the previous unrestricted behaviour', async () => {
      workflow = null;

      await expect(changeStatus('done', 'col-done')).resolves.toMatchObject({
        statusId: 'done',
      });
      await expect(move('col-done')).resolves.toMatchObject({
        statusId: 'done',
      });
    });
  });
});
