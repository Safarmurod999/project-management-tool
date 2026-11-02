import {
  CardRepository,
  ColumnStatusRepository,
  Status,
  StatusRepository,
} from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { DeleteStatusUsecaseImpl } from './delete-status.usecase';

describe('DeleteStatusUsecaseImpl', () => {
  let statusRepository: jest.Mocked<StatusRepository>;
  let columnStatusRepository: jest.Mocked<ColumnStatusRepository>;
  let cardRepository: jest.Mocked<CardRepository>;
  let usecase: DeleteStatusUsecaseImpl;

  const setup = (isDefault: boolean, cardsUsingIt: number) => {
    statusRepository = {
      findById: jest
        .fn()
        .mockResolvedValue(
          new Status(
            's1',
            'p1',
            'S',
            's',
            '#000000',
            0,
            isDefault,
            1,
            new Date(),
          ),
        ),
      delete: jest.fn().mockResolvedValue('s1'),
    } as unknown as jest.Mocked<StatusRepository>;
    columnStatusRepository = {
      deleteByStatusId: jest.fn().mockResolvedValue(2),
    } as unknown as jest.Mocked<ColumnStatusRepository>;
    cardRepository = {
      countByStatusId: jest.fn().mockResolvedValue(cardsUsingIt),
    } as unknown as jest.Mocked<CardRepository>;
    const transactionManager: TransactionManager = {
      run: jest.fn((work) => work()),
    };

    usecase = new DeleteStatusUsecaseImpl(
      statusRepository,
      columnStatusRepository,
      cardRepository,
      transactionManager,
      {
        emitToRoom: jest.fn(),
        emitToUser: jest.fn(),
        broadcast: jest.fn(),
      },
    );
  };

  it('removes the status together with its column mappings', async () => {
    setup(false, 0);

    await expect(usecase.execute({ id: 's1' })).resolves.toBe('s1');
    expect(columnStatusRepository.deleteByStatusId).toHaveBeenCalledWith('s1');
    expect(statusRepository.delete).toHaveBeenCalledWith('s1');
  });

  it('refuses to delete a status used by cards', async () => {
    setup(false, 3);

    await expect(usecase.execute({ id: 's1' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(statusRepository.delete).not.toHaveBeenCalled();
  });

  it('refuses to delete the project default status', async () => {
    setup(true, 0);

    await expect(usecase.execute({ id: 's1' })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(columnStatusRepository.deleteByStatusId).not.toHaveBeenCalled();
  });
});
