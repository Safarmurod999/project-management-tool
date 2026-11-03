import {
  CardRepository,
  StatusRepository,
  Workflow,
  WorkflowFactoryImpl,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransition,
  WorkflowTransitionFactoryImpl,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { CreateWorkflowUsecaseImpl } from './create';
import { UpdateWorkflowUsecaseImpl } from './update';
import { DeleteWorkflowUsecaseImpl } from './delete';
import { RemoveWorkflowStatusUsecaseImpl } from './remove-status';
import { CreateWorkflowTransitionUsecaseImpl } from './create-transition';
import { UpdateWorkflowTransitionUsecaseImpl } from './update-transition';

const workflowOf = (id: string, isDefault: boolean) =>
  new Workflow(id, 'p1', id, null, isDefault, 1, new Date());

describe('Workflow use cases', () => {
  let workflows: Record<string, Workflow>;
  let rules: Array<[string, string]>;
  let workflowRepository: jest.Mocked<WorkflowRepository>;
  let workflowStatusRepository: jest.Mocked<WorkflowStatusRepository>;
  let workflowTransitionRepository: jest.Mocked<WorkflowTransitionRepository>;
  let statusRepository: jest.Mocked<StatusRepository>;
  let cardRepository: jest.Mocked<CardRepository>;
  let transactionManager: jest.Mocked<TransactionManager>;
  let socket: jest.Mocked<RealtimeService>;

  beforeEach(() => {
    workflows = { w1: workflowOf('w1', true), w2: workflowOf('w2', false) };
    rules = [];

    workflowRepository = {
      findById: jest.fn(async (id: string) => workflows[id]),
      findByProjectId: jest.fn(async () => Object.values(workflows)),
      findDefaultByProjectId: jest.fn(
        async () => Object.values(workflows).find((w) => w.isDefault) ?? null,
      ),
      create: jest.fn(
        async (data) =>
          new Workflow(
            'new',
            data.projectId,
            data.name,
            data.description,
            data.isDefault,
            1,
            new Date(),
          ),
      ),
      update: jest.fn(async (data) =>
        workflowOf(data.id, data.isDefault ?? workflows[data.id].isDefault),
      ),
      clearDefault: jest.fn(),
      delete: jest.fn(async (id: string) => id),
    } as unknown as jest.Mocked<WorkflowRepository>;
    workflowStatusRepository = {
      createMany: jest.fn(async () => []),
      findByWorkflowId: jest.fn(async () => []),
      exists: jest.fn(async () => true),
      delete: jest.fn(async () => 'ws'),
      deleteByWorkflowId: jest.fn(async () => 0),
    } as unknown as jest.Mocked<WorkflowStatusRepository>;
    workflowTransitionRepository = {
      exists: jest.fn(async (_w: string, from: string, to: string) =>
        rules.some(([a, b]) => a === from && b === to),
      ),
      createMany: jest.fn(async () => []),
      findById: jest.fn(
        async (id: string) =>
          new WorkflowTransition(id, 'w1', 'todo', 'done', new Date()),
      ),
      findByWorkflowId: jest.fn(async () => []),
      update: jest.fn(),
      deleteByStatus: jest.fn(async () => 2),
      deleteByWorkflowId: jest.fn(async () => 0),
    } as unknown as jest.Mocked<WorkflowTransitionRepository>;
    statusRepository = {
      findByIds: jest.fn(async () => []),
    } as unknown as jest.Mocked<StatusRepository>;
    cardRepository = {
      countByStatusId: jest.fn(async () => 0),
    } as unknown as jest.Mocked<CardRepository>;
    transactionManager = {
      run: jest.fn((work) => work()),
    } as unknown as jest.Mocked<TransactionManager>;
    socket = {
      emitToRoom: jest.fn(),
      emitToUser: jest.fn(),
      broadcast: jest.fn(),
    };
  });

  describe('CreateWorkflowUsecase', () => {
    const create = () =>
      new CreateWorkflowUsecaseImpl(
        workflowRepository,
        workflowStatusRepository,
        workflowTransitionRepository,
        statusRepository,
        new WorkflowFactoryImpl(),
        new WorkflowTransitionFactoryImpl(),
        transactionManager,
        socket,
      );

    it('makes the first workflow of a project the default', async () => {
      workflows = {};

      const details = await create().execute({
        projectId: 'p1',
        name: 'Flow',
        statusIds: ['todo', 'done'],
        transitions: [
          { fromStatusId: 'todo', toStatusId: 'done', bidirectional: true },
        ],
      });

      expect(details.workflow.isDefault).toBe(true);
      expect(workflowRepository.clearDefault).not.toHaveBeenCalled();
      expect(workflowStatusRepository.createMany).toHaveBeenCalledWith('new', [
        'todo',
        'done',
      ]);
      expect(workflowTransitionRepository.createMany).toHaveBeenCalledWith([
        { workflowId: 'new', fromStatusId: 'todo', toStatusId: 'done' },
        { workflowId: 'new', fromStatusId: 'done', toStatusId: 'todo' },
      ]);
      expect(socket.emitToRoom).toHaveBeenCalledWith(
        'project:p1',
        'workflow:created',
        expect.objectContaining({ id: 'new', transitions: [] }),
      );
    });

    it('rejects a self-transition before writing', async () => {
      await expect(
        create().execute({
          projectId: 'p1',
          name: 'Flow',
          transitions: [{ fromStatusId: 'todo', toStatusId: 'todo' }],
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(workflowRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('UpdateWorkflowUsecase', () => {
    const update = () =>
      new UpdateWorkflowUsecaseImpl(
        workflowRepository,
        workflowStatusRepository,
        workflowTransitionRepository,
        statusRepository,
        new WorkflowFactoryImpl(),
        transactionManager,
        socket,
      );

    it('promoting a workflow clears the previous default', async () => {
      await update().execute({ id: 'w2', isDefault: true });

      expect(workflowRepository.clearDefault).toHaveBeenCalledWith('p1', 'w2');
    });

    it('refuses to unset the default directly', async () => {
      await expect(
        update().execute({ id: 'w1', isDefault: false }),
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(workflowRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('DeleteWorkflowUsecase', () => {
    const remove = () =>
      new DeleteWorkflowUsecaseImpl(
        workflowRepository,
        workflowStatusRepository,
        workflowTransitionRepository,
        transactionManager,
        socket,
      );

    it('refuses to delete the default while other workflows exist', async () => {
      await expect(remove().execute({ id: 'w1' })).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it('deletes a workflow with its statuses and rules', async () => {
      await expect(remove().execute({ id: 'w2' })).resolves.toBe('w2');
      expect(
        workflowTransitionRepository.deleteByWorkflowId,
      ).toHaveBeenCalledWith('w2');
      expect(workflowStatusRepository.deleteByWorkflowId).toHaveBeenCalledWith(
        'w2',
      );
    });
  });

  describe('RemoveWorkflowStatusUsecase', () => {
    const removeStatus = () =>
      new RemoveWorkflowStatusUsecaseImpl(
        workflowRepository,
        workflowStatusRepository,
        workflowTransitionRepository,
        statusRepository,
        cardRepository,
        transactionManager,
        socket,
      );

    it('refuses while cards governed by the workflow use the status', async () => {
      cardRepository.countByStatusId.mockResolvedValue(3);

      await expect(
        removeStatus().execute({ workflowId: 'w1', statusId: 'todo' }),
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(workflowStatusRepository.delete).not.toHaveBeenCalled();
    });

    it('removes the status and its rules in one transaction', async () => {
      await removeStatus().execute({ workflowId: 'w1', statusId: 'todo' });

      expect(transactionManager.run).toHaveBeenCalledTimes(1);
      expect(workflowTransitionRepository.deleteByStatus).toHaveBeenCalledWith(
        'w1',
        'todo',
      );
      expect(workflowStatusRepository.delete).toHaveBeenCalledWith(
        'w1',
        'todo',
      );
    });
  });

  describe('CreateWorkflowTransitionUsecase', () => {
    const createTransition = () =>
      new CreateWorkflowTransitionUsecaseImpl(
        workflowRepository,
        workflowStatusRepository,
        workflowTransitionRepository,
        statusRepository,
        new WorkflowTransitionFactoryImpl(),
        transactionManager,
        socket,
      );

    it('creates only the missing direction of a two-way transition', async () => {
      rules = [['todo', 'done']];

      await createTransition().execute({
        workflowId: 'w1',
        fromStatusId: 'todo',
        toStatusId: 'done',
        bidirectional: true,
      });

      expect(workflowTransitionRepository.createMany).toHaveBeenCalledWith([
        { workflowId: 'w1', fromStatusId: 'done', toStatusId: 'todo' },
      ]);
    });

    it('rejects a duplicate one-way rule', async () => {
      rules = [['todo', 'done']];

      await expect(
        createTransition().execute({
          workflowId: 'w1',
          fromStatusId: 'todo',
          toStatusId: 'done',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(workflowTransitionRepository.createMany).not.toHaveBeenCalled();
    });
  });

  describe('UpdateWorkflowTransitionUsecase', () => {
    it('rejects a transition of another workflow', async () => {
      const usecase = new UpdateWorkflowTransitionUsecaseImpl(
        workflowRepository,
        workflowStatusRepository,
        workflowTransitionRepository,
        statusRepository,
        socket,
      );

      await expect(
        usecase.execute({
          workflowId: 'w2',
          transitionId: 't1',
          toStatusId: 'todo',
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(workflowTransitionRepository.update).not.toHaveBeenCalled();
    });
  });
});
