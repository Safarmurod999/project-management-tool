import {
  Board,
  BoardRepository,
  Card,
  CardRepository,
  Column,
  ColumnRepository,
  ColumnStatus,
  ColumnStatusRepository,
  Status,
  StatusRepository,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { ReorderCardUsecaseImpl } from './reorder-card.usecase';

const status = (id: string, isDefault = false) =>
  new Status(id, 'p1', id, id, '#000000', 0, isDefault, 1, new Date());

describe('ReorderCardUsecaseImpl (card transitions)', () => {
  let cardRepository: jest.Mocked<CardRepository>;
  let transactionManager: jest.Mocked<TransactionManager>;
  let usecase: ReorderCardUsecaseImpl;

  beforeEach(() => {
    const statuses: Record<string, Status> = {
      todo: status('todo', true),
      in_progress: status('in_progress'),
      testing: status('testing'),
    };
    const mappings = [
      new ColumnStatus('m1', 'col-todo', 'todo', 0, new Date()),
      new ColumnStatus('m2', 'col-progress', 'in_progress', 0, new Date()),
      new ColumnStatus('m3', 'col-progress', 'testing', 1, new Date()),
    ];

    cardRepository = {
      findById: jest.fn(
        async (id: string) => new Card(id, 'col-todo', 'Card', null, 0, 'todo'),
      ),
      reorder: jest.fn(
        async (params) =>
          new Card(
            params.cardId,
            params.targetColumnId,
            'Card',
            null,
            params.newIndex,
            params.statusId!,
          ),
      ),
    } as unknown as jest.Mocked<CardRepository>;
    transactionManager = {
      run: jest.fn((work) => work()),
    } as unknown as jest.Mocked<TransactionManager>;

    usecase = new ReorderCardUsecaseImpl(
      cardRepository,
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
          mappings.filter((m) => m.columnId === columnId),
        ),
      } as unknown as ColumnStatusRepository,
      // No workflow: the project is not restricted.
      {
        findDefaultByProjectId: jest.fn().mockResolvedValue(null),
      } as unknown as WorkflowRepository,
      {} as WorkflowStatusRepository,
      {} as WorkflowTransitionRepository,
      transactionManager,
    );
  });

  const move = (statusId?: string) =>
    usecase.execute({
      cardId: 'card-1',
      sourceColumnId: 'col-todo',
      targetColumnId: 'col-progress',
      newIndex: 0,
      statusId,
    });

  it('moves to the target column first status when none is given', async () => {
    const card = await move();

    expect(card.statusId).toBe('in_progress');
    expect(transactionManager.run).toHaveBeenCalledTimes(1);
    expect(cardRepository.reorder).toHaveBeenCalledWith(
      expect.objectContaining({
        targetColumnId: 'col-progress',
        statusId: 'in_progress',
      }),
    );
  });

  it('accepts an explicit status of the target column', async () => {
    await expect(move('testing')).resolves.toMatchObject({
      statusId: 'testing',
    });
  });

  it('rejects a status that is not mapped to the target column', async () => {
    await expect(move('todo')).rejects.toMatchObject({ statusCode: 400 });
    expect(cardRepository.reorder).not.toHaveBeenCalled();
  });

  it('rejects a negative index before touching the database', async () => {
    await expect(
      usecase.execute({
        cardId: 'c',
        sourceColumnId: 'a',
        targetColumnId: 'b',
        newIndex: -1,
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(cardRepository.findById).not.toHaveBeenCalled();
  });
});
