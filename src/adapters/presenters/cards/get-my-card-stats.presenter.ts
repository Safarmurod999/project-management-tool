import { AssignedCardStats } from 'src/domain';

export interface GetMyCardStatsPresenter {
  present(stats: AssignedCardStats): AssignedCardStats;
}

export class GetMyCardStatsPresenterImpl implements GetMyCardStatsPresenter {
  present(stats: AssignedCardStats): AssignedCardStats {
    return {
      assignedCards: stats.assignedCards,
      doneCards: stats.doneCards,
      openCards: stats.openCards,
      totalPoints: stats.totalPoints,
      donePoints: stats.donePoints,
      byStatus: stats.byStatus.map((item) => ({
        statusId: item.statusId,
        name: item.name,
        color: item.color,
        count: item.count,
      })),
    };
  }
}
