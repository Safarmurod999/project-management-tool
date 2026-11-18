import { CardRepository } from 'src/domain';
import { GetMyCardStatsUsecaseImpl } from '../get-my-stats';
import { GetMyCardsUsecaseImpl } from './get-my-cards.usecase';

describe('GetMyCardsUsecaseImpl', () => {
  const empty = { data: [], page: 1, limit: 10, totalCount: 0 };
  let cardRepository: {
    findAssignedTo: jest.Mock;
    getAssignedStats: jest.Mock;
  };
  let usecase: GetMyCardsUsecaseImpl;

  beforeEach(() => {
    cardRepository = {
      findAssignedTo: jest.fn().mockResolvedValue(empty),
      getAssignedStats: jest.fn(),
    };
    usecase = new GetMyCardsUsecaseImpl(
      cardRepository as unknown as CardRepository,
    );
  });

  it('lists the caller’s cards with the default page', async () => {
    await usecase.execute({ userId: 'user-1' });

    expect(cardRepository.findAssignedTo).toHaveBeenCalledWith({
      assigneeId: 'user-1',
      page: 1,
      limit: 10,
      projectId: undefined,
      statusId: undefined,
      title: undefined,
      done: undefined,
    });
  });

  it('passes the filters and caps the limit at 100', async () => {
    await usecase.execute({
      userId: 'user-1',
      page: 2,
      limit: 1000,
      projectId: 'p1',
      statusId: 's1',
      title: '  login ',
      done: false,
    });

    expect(cardRepository.findAssignedTo).toHaveBeenCalledWith({
      assigneeId: 'user-1',
      page: 2,
      limit: 100,
      projectId: 'p1',
      statusId: 's1',
      title: 'login',
      done: false,
    });
  });

  it('ignores empty filters', async () => {
    await usecase.execute({
      userId: 'user-1',
      projectId: '',
      statusId: '',
      title: '   ',
    });

    expect(cardRepository.findAssignedTo).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: undefined,
        statusId: undefined,
        title: undefined,
      }),
    );
  });
});

describe('GetMyCardStatsUsecaseImpl', () => {
  it('counts the caller’s cards, optionally for one project', async () => {
    const stats = {
      assignedCards: 3,
      doneCards: 1,
      openCards: 2,
      totalPoints: 8,
      donePoints: 3,
      byStatus: [],
    };
    const cardRepository = {
      getAssignedStats: jest.fn().mockResolvedValue(stats),
    };
    const usecase = new GetMyCardStatsUsecaseImpl(
      cardRepository as unknown as CardRepository,
    );

    await expect(
      usecase.execute({ userId: 'user-1', projectId: 'p1' }),
    ).resolves.toBe(stats);
    await usecase.execute({ userId: 'user-1', projectId: '' });

    expect(cardRepository.getAssignedStats).toHaveBeenNthCalledWith(1, {
      assigneeId: 'user-1',
      projectId: 'p1',
    });
    expect(cardRepository.getAssignedStats).toHaveBeenNthCalledWith(2, {
      assigneeId: 'user-1',
      projectId: undefined,
    });
  });
});
