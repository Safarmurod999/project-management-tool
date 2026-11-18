import { PipelineStage, Types } from 'mongoose';
import { BoardStatus, ProjectStatus } from 'src/infrastructure/common/enum';

/** Collection names joined by the assigned-cards pipelines. */
export interface AssignedCardsCollections {
  columns: string;
  boards: string;
  projects: string;
  statuses: string;
  users: string;
}

export interface AssignedCardsFilter {
  assigneeId: string;
  projectId?: string;
  statusId?: string;
  /** Case-insensitive partial match. */
  title?: string;
}

export interface AssignedCardsListOptions extends AssignedCardsFilter {
  page: number;
  limit: number;
  /** true: only cards in a done status; false: only cards that are not. */
  done?: boolean;
}

/** Escapes user input so it is matched literally inside a `$regex`. */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Cards assigned to one user, joined with their column, board, project and
 * status, without cards on archived boards or in archived projects. Every
 * join is an `_id` lookup, so the whole result is computed in one query.
 */
export const buildAssignedCardsBasePipeline = (
  filter: AssignedCardsFilter,
  collections: AssignedCardsCollections,
): PipelineStage[] => {
  const cardMatch: Record<string, unknown> = {
    assigneeId: new Types.ObjectId(filter.assigneeId),
  };

  if (filter.statusId) {
    cardMatch.statusId = new Types.ObjectId(filter.statusId);
  }

  if (filter.title) {
    cardMatch.title = { $regex: escapeRegex(filter.title), $options: 'i' };
  }

  const boardMatch: Record<string, unknown> = {
    'board.status': { $ne: BoardStatus.ARCHIVED },
  };

  if (filter.projectId) {
    boardMatch['board.projectId'] = new Types.ObjectId(filter.projectId);
  }

  return [
    { $match: cardMatch },
    {
      $lookup: {
        from: collections.columns,
        localField: 'columnId',
        foreignField: '_id',
        as: 'column',
      },
    },
    { $unwind: '$column' },
    {
      $lookup: {
        from: collections.boards,
        localField: 'column.boardId',
        foreignField: '_id',
        as: 'board',
      },
    },
    { $unwind: '$board' },
    { $match: boardMatch },
    {
      $lookup: {
        from: collections.projects,
        localField: 'board.projectId',
        foreignField: '_id',
        as: 'project',
      },
    },
    { $unwind: '$project' },
    { $match: { 'project.status': { $ne: ProjectStatus.ARCHIVED } } },
    {
      $lookup: {
        from: collections.statuses,
        localField: 'statusId',
        foreignField: '_id',
        as: 'status',
      },
    },
    // A card whose status was removed is still listed (and counted as open).
    { $unwind: { path: '$status', preserveNullAndEmptyArrays: true } },
  ];
};

/**
 * One page of assigned cards, newest activity (`updatedAt ?? createdAt`)
 * first, plus the total count, as `[{ data: [...], total: [{ count }] }]`.
 */
export const buildAssignedCardsListPipeline = (
  options: AssignedCardsListOptions,
  collections: AssignedCardsCollections,
): PipelineStage[] => {
  const stages: PipelineStage[] = buildAssignedCardsBasePipeline(
    options,
    collections,
  );

  if (options.done !== undefined) {
    stages.push({
      $match: options.done
        ? { 'status.isDone': true }
        : { 'status.isDone': { $ne: true } },
    });
  }

  stages.push(
    { $addFields: { sortDate: { $ifNull: ['$updatedAt', '$createdAt'] } } },
    { $sort: { sortDate: -1, _id: -1 } },
    {
      $facet: {
        data: [
          { $skip: (options.page - 1) * options.limit },
          { $limit: options.limit },
          // Only the assigner's name is read, never the rest of the user.
          {
            $lookup: {
              from: collections.users,
              let: { assignerId: '$assignerId' },
              pipeline: [
                { $match: { $expr: { $eq: ['$_id', '$$assignerId'] } } },
                { $project: { name: 1 } },
              ],
              as: 'assigner',
            },
          },
          { $addFields: { assigner: { $arrayElemAt: ['$assigner', 0] } } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  );

  return stages;
};

const isDone = { $eq: ['$status.isDone', true] };
const points = { $ifNull: ['$points', 0] };

/**
 * Totals and per-status counts of the cards assigned to one user, as
 * `[{ totals: [{ assignedCards, doneCards, totalPoints, donePoints }], byStatus: [...] }]`.
 */
export const buildAssignedCardsStatsPipeline = (
  filter: Pick<AssignedCardsFilter, 'assigneeId' | 'projectId'>,
  collections: AssignedCardsCollections,
): PipelineStage[] => [
  ...buildAssignedCardsBasePipeline(filter, collections),
  {
    $facet: {
      totals: [
        {
          $group: {
            _id: null,
            assignedCards: { $sum: 1 },
            doneCards: { $sum: { $cond: [isDone, 1, 0] } },
            totalPoints: { $sum: points },
            donePoints: { $sum: { $cond: [isDone, points, 0] } },
          },
        },
      ],
      byStatus: [
        {
          $group: {
            _id: '$statusId',
            name: { $first: '$status.name' },
            color: { $first: '$status.color' },
            order: { $first: '$status.order' },
            count: { $sum: 1 },
          },
        },
        { $sort: { order: 1, name: 1, _id: 1 } },
      ],
    },
  },
];
