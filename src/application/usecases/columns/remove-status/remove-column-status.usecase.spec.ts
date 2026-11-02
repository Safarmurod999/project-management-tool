import {
  CardRepository,
  ColumnStatus,
  ColumnStatusRepository,
} from 'src/domain';
import { RemoveColumnStatusUsecaseImpl } from './remove-column-status.usecase';

describe('RemoveColumnStatusUsecaseImpl', () => {
  const mapping = new ColumnStatus('m1', 'col-1', 's1', 0, new Date());

  const build = (existing: ColumnStatus | null, cardsUsingIt: number) => {
    const columnStatusRepository = {
      findOne: jest.fn().mockResolvedValue(existing),
      delete: jest.fn().mockResolvedValue('m1'),
    } as unknown as jest.Mocked<ColumnStatusRepository>;
    const cardRepository = {
      countByStatusId: jest.fn().mockResolvedValue(cardsUsingIt),
    } as unknown as jest.Mocked<CardRepository>;
    return {
      columnStatusRepository,
      cardRepository,
      usecase: new RemoveColumnStatusUsecaseImpl(
        columnStatusRepository,
        cardRepository,
      ),
    };
  };

  it('unmaps a status no card in the column uses', async () => {
    const { usecase, columnStatusRepository, cardRepository } = build(
      mapping,
      0,
    );

    await expect(
      usecase.execute({ columnId: 'col-1', statusId: 's1' }),
    ).resolves.toBe('m1');
    expect(cardRepository.countByStatusId).toHaveBeenCalledWith('s1', 'col-1');
    expect(columnStatusRepository.delete).toHaveBeenCalledWith('col-1', 's1');
  });

  it('keeps the mapping while cards in the column still use the status', async () => {
    const { usecase, columnStatusRepository } = build(mapping, 1);

    await expect(
      usecase.execute({ columnId: 'col-1', statusId: 's1' }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(columnStatusRepository.delete).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown mapping', async () => {
    const { usecase } = build(null, 0);

    await expect(
      usecase.execute({ columnId: 'col-1', statusId: 's1' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
