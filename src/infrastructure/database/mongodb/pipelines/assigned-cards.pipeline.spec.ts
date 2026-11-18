import { PipelineStage, Types } from 'mongoose';
import { BoardStatus, ProjectStatus } from 'src/infrastructure/common/enum';
import {
  AssignedCardsCollections,
  buildAssignedCardsBasePipeline,
  buildAssignedCardsListPipeline,
  buildAssignedCardsStatsPipeline,
  escapeRegex,
} from './assigned-cards.pipeline';

type Lookup = PipelineStage.Lookup['$lookup'] & {
  localField?: string;
  foreignField?: string;
  pipeline?: unknown[];
};

const lookups = (stages: unknown[]): Lookup[] =>
  (stages as PipelineStage[]).flatMap((item) =>
    '$lookup' in item ? [item.$lookup as Lookup] : [],
  );

const matches = (stages: unknown[]): unknown[] =>
  (stages as PipelineStage[]).flatMap((item) =>
    '$match' in item ? [item.$match] : [],
  );

const facetOf = (stages: PipelineStage[]): Record<string, unknown[]> => {
  const facet = stages.find(
    (item): item is PipelineStage.Facet => '$facet' in item,
  );
  return facet!.$facet as Record<string, unknown[]>;
};

describe('assigned cards pipelines', () => {
  const collections: AssignedCardsCollections = {
    columns: 'columns',
    boards: 'boards',
    projects: 'projects',
    statuses: 'statuses',
    users: 'users',
  };
  const userId = new Types.ObjectId().toString();
  const projectId = new Types.ObjectId().toString();
  const statusId = new Types.ObjectId().toString();

  describe('base', () => {
    it('starts from the assignee and joins column, board, project and status by _id', () => {
      const stages = buildAssignedCardsBasePipeline(
        { assigneeId: userId },
        collections,
      );

      expect(stages[0]).toEqual({
        $match: { assigneeId: new Types.ObjectId(userId) },
      });
      expect(
        lookups(stages).map((item) => [
          item.from,
          item.localField,
          item.foreignField,
        ]),
      ).toEqual([
        ['columns', 'columnId', '_id'],
        ['boards', 'column.boardId', '_id'],
        ['projects', 'board.projectId', '_id'],
        ['statuses', 'statusId', '_id'],
      ]);
    });

    it('excludes archived boards and archived projects', () => {
      const found = matches(
        buildAssignedCardsBasePipeline({ assigneeId: userId }, collections),
      );

      expect(found).toContainEqual({
        'board.status': { $ne: BoardStatus.ARCHIVED },
      });
      expect(found).toContainEqual({
        'project.status': { $ne: ProjectStatus.ARCHIVED },
      });
    });

    it('applies the optional status, title and project filters', () => {
      const found = matches(
        buildAssignedCardsBasePipeline(
          { assigneeId: userId, statusId, projectId, title: 'Fix (api)' },
          collections,
        ),
      );

      expect(found[0]).toEqual({
        assigneeId: new Types.ObjectId(userId),
        statusId: new Types.ObjectId(statusId),
        title: { $regex: 'Fix \\(api\\)', $options: 'i' },
      });
      expect(found[1]).toEqual({
        'board.status': { $ne: BoardStatus.ARCHIVED },
        'board.projectId': new Types.ObjectId(projectId),
      });
    });

    it('keeps cards whose status no longer exists', () => {
      const stages = buildAssignedCardsBasePipeline(
        { assigneeId: userId },
        collections,
      );

      expect(stages[stages.length - 1]).toEqual({
        $unwind: { path: '$status', preserveNullAndEmptyArrays: true },
      });
    });
  });

  describe('list', () => {
    const list = (done?: boolean) =>
      buildAssignedCardsListPipeline(
        { assigneeId: userId, page: 3, limit: 20, done },
        collections,
      );

    it('sorts by updatedAt falling back to createdAt, newest first', () => {
      const stages = list();

      expect(stages).toContainEqual({
        $addFields: { sortDate: { $ifNull: ['$updatedAt', '$createdAt'] } },
      });
      expect(stages).toContainEqual({ $sort: { sortDate: -1, _id: -1 } });
    });

    it('paginates inside the facet and counts the full result', () => {
      const facet = facetOf(list());

      expect(facet.data.slice(0, 2)).toEqual([{ $skip: 40 }, { $limit: 20 }]);
      expect(facet.total).toEqual([{ $count: 'count' }]);
    });

    it('only reads the assigner name', () => {
      const [assigner] = lookups(facetOf(list()).data);

      expect(assigner.from).toBe('users');
      expect(assigner.pipeline).toContainEqual({ $project: { name: 1 } });
    });

    it.each([
      [true, { 'status.isDone': true }],
      [false, { 'status.isDone': { $ne: true } }],
    ])('filters done=%s', (done, expected) => {
      expect(list(done)).toContainEqual({ $match: expected });
    });

    it('does not filter on done when it is not given', () => {
      expect(JSON.stringify(matches(list()))).not.toContain('isDone');
    });
  });

  describe('stats', () => {
    it('counts totals and done cards, and groups by status', () => {
      const stages = buildAssignedCardsStatsPipeline(
        { assigneeId: userId, projectId },
        collections,
      );
      const facet = facetOf(stages);
      const isDone = { $eq: ['$status.isDone', true] };
      const points = { $ifNull: ['$points', 0] };

      expect(facet.totals[0]).toEqual({
        $group: {
          _id: null,
          assignedCards: { $sum: 1 },
          doneCards: { $sum: { $cond: [isDone, 1, 0] } },
          totalPoints: { $sum: points },
          donePoints: { $sum: { $cond: [isDone, points, 0] } },
        },
      });
      expect(facet.byStatus[0]).toMatchObject({
        $group: { _id: '$statusId', count: { $sum: 1 } },
      });
      expect(stages).toContainEqual({
        $match: {
          'board.status': { $ne: BoardStatus.ARCHIVED },
          'board.projectId': new Types.ObjectId(projectId),
        },
      });
    });
  });

  it('escapes regex characters in user input', () => {
    expect(escapeRegex('a.b*c?(d)[e]{f}|g^h$i\\j+')).toBe(
      'a\\.b\\*c\\?\\(d\\)\\[e\\]\\{f\\}\\|g\\^h\\$i\\\\j\\+',
    );
  });
});
