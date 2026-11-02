import { mongo, Types } from 'mongoose';
import {
  buildDefaultStatuses,
  DEFAULT_COLUMNS,
} from 'src/domain/statuses/defaults';
import {
  BoardStatus,
  CardStatus,
  PermissionCode,
  PermissionStatus,
} from 'src/infrastructure/common/enum';
import { Database } from 'src/infrastructure/database/database';
import { Logger } from 'src/infrastructure/logger';
import {
  BoardPlan,
  planBoard,
  PlanStatus,
  toStatusCode,
} from './dynamic-statuses.plan';

export const MIGRATION_ID = '001-dynamic-statuses';
const BACKUP_COLLECTION = 'migration_backups';

const STATUS_PERMISSIONS: Array<[PermissionCode, PermissionCode]> = [
  [PermissionCode.COLUMN_CREATE, PermissionCode.STATUS_CREATE],
  [PermissionCode.COLUMN_GET, PermissionCode.STATUS_GET],
  [PermissionCode.COLUMN_EDIT, PermissionCode.STATUS_EDIT],
  [PermissionCode.COLUMN_DELETE, PermissionCode.STATUS_DELETE],
];

type Doc = Record<string, any> & { _id: Types.ObjectId };
type Collection = mongo.Collection;
type ClientSession = mongo.ClientSession;

interface ProjectPlan {
  projectId: Types.ObjectId;
  /** Statuses to insert (empty when the project already has statuses). */
  newStatuses: Doc[];
  boards: Array<{
    boardId: Types.ObjectId;
    /** Default columns to create for boards that have none. */
    newColumns: Doc[];
    plan: BoardPlan;
  }>;
}

export interface MigrationReport {
  dryRun: boolean;
  transactional: boolean;
  columnsByLegacyStatus: Record<string, number>;
  cardsByLegacyStatus: Record<string, number>;
  unknownCardStatuses: Record<string, number>;
  statusesCreated: number;
  columnsCreated: number;
  mappingsCreated: number;
  cardsUpdated: number;
  cardsAdjusted: Array<{ cardId: string; from?: string; to: string }>;
  mappingReasons: Record<string, number>;
  permissionsCreated: number;
  rolePermissionsCreated: number;
}

export interface VerificationResult {
  ok: boolean;
  problems: string[];
  counts: Record<string, number>;
}

/**
 * Migration 001: replaces the `CardStatus` enum on cards with project-scoped
 * Status records, maps statuses to board columns (ColumnStatus) and removes the
 * redundant `BoardStatus` field from columns.
 *
 * Safe to re-run: projects that already have statuses, boards that already
 * have mappings and cards that already have a `statusId` are left untouched.
 * Removed field values are copied to `migration_backups` before they are unset.
 */
export class DynamicStatusesMigration {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  async run(options: { dryRun: boolean }): Promise<MigrationReport> {
    const transactional = await this.supportsTransactions();
    const report = this.emptyReport(options.dryRun, transactional);

    await this.inspect(report);
    const plans = await this.plan(report);

    const unresolved = plans.flatMap((project) =>
      project.boards.flatMap((board) => board.plan.unresolvedCardIds),
    );
    if (unresolved.length > 0) {
      throw new Error(
        `Migration aborted before writing: cards ${unresolved.join(', ')} are in columns that would have no status.`,
      );
    }

    // Cards whose column or board no longer exists cannot get a valid status.
    const plannedCardIds = new Set(
      plans.flatMap((p) =>
        p.boards.flatMap((b) => b.plan.cards.map((c) => c.cardId)),
      ),
    );
    const orphans = (
      await this.raw('Card')
        .find({ statusId: { $exists: false } }, { projection: { _id: 1 } })
        .toArray()
    )
      .map((card) => card._id.toString())
      .filter((id) => !plannedCardIds.has(id));
    if (orphans.length > 0) {
      throw new Error(
        `Migration aborted before writing: ${orphans.length} card(s) belong to no existing board/column: ${orphans.slice(0, 20).join(', ')}`,
      );
    }

    if (options.dryRun) {
      return report;
    }

    if (!transactional) {
      this.logger.warn(
        'MongoDB is standalone: writes are not transactional. Removed fields are backed up to migration_backups first.',
      );
    }

    // Indexes first: this creates the new collections outside any transaction
    // and lets the unique indexes guard the writes below.
    await this.database.statusModel().createIndexes();
    await this.database.columnStatusModel().createIndexes();
    await this.database.cardModel().createIndexes();

    for (const project of plans) {
      await this.withSession(transactional, (session) =>
        this.applyProject(project, session),
      );
    }

    await this.withSession(transactional, (session) =>
      this.removeColumnStatusField(session),
    );
    await this.withSession(transactional, (session) =>
      this.seedPermissions(report, session),
    );

    return report;
  }

  /** Checks the invariants the new model requires. */
  async verify(): Promise<VerificationResult> {
    const problems: string[] = [];
    const cards = this.raw('Card');
    const columns = this.raw('Column');
    const projects = this.raw('Project');

    const counts: Record<string, number> = {
      projects: await projects.countDocuments(),
      statuses: await this.raw('Status').countDocuments(),
      boards: await this.raw('Board').countDocuments(),
      columns: await columns.countDocuments(),
      columnStatuses: await this.raw('ColumnStatus').countDocuments(),
      cards: await cards.countDocuments(),
    };

    const check = async (label: string, count: Promise<number> | number) => {
      const value = await count;
      counts[label] = value;
      if (value > 0) problems.push(`${value} ${label}`);
    };

    await check(
      'cards without statusId',
      cards.countDocuments({ statusId: { $exists: false } }),
    );
    await check(
      'cards still holding legacy status',
      cards.countDocuments({ status: { $exists: true } }),
    );
    await check(
      'columns still holding status',
      columns.countDocuments({ status: { $exists: true } }),
    );

    await check(
      'projects without statuses',
      this.countAggregate(projects, [
        {
          $lookup: {
            from: this.name('Status'),
            localField: '_id',
            foreignField: 'projectId',
            as: 's',
          },
        },
        { $match: { s: { $size: 0 } } },
      ]),
    );

    // Card status must be mapped to the card's own column.
    await check(
      'cards whose status is not mapped to their column',
      this.countAggregate(cards, [
        {
          $lookup: {
            from: this.name('ColumnStatus'),
            let: { columnId: '$columnId', statusId: '$statusId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$columnId', '$$columnId'] },
                      { $eq: ['$statusId', '$$statusId'] },
                    ],
                  },
                },
              },
            ],
            as: 'm',
          },
        },
        { $match: { m: { $size: 0 } } },
      ]),
    );

    // Mapping status must belong to the board's project.
    await check(
      'column statuses crossing projects',
      this.countAggregate(this.raw('ColumnStatus'), [
        {
          $lookup: {
            from: this.name('Board'),
            localField: 'boardId',
            foreignField: '_id',
            as: 'b',
          },
        },
        {
          $lookup: {
            from: this.name('Status'),
            localField: 'statusId',
            foreignField: '_id',
            as: 's',
          },
        },
        {
          $match: {
            $expr: {
              $ne: [
                { $arrayElemAt: ['$b.projectId', 0] },
                { $arrayElemAt: ['$s.projectId', 0] },
              ],
            },
          },
        },
      ]),
    );

    await check(
      'column statuses whose boardId differs from their column',
      this.countAggregate(this.raw('ColumnStatus'), [
        {
          $lookup: {
            from: this.name('Column'),
            localField: 'columnId',
            foreignField: '_id',
            as: 'c',
          },
        },
        {
          $match: {
            $expr: { $ne: ['$boardId', { $arrayElemAt: ['$c.boardId', 0] }] },
          },
        },
      ]),
    );

    return { ok: problems.length === 0, problems, counts };
  }

  private async inspect(report: MigrationReport): Promise<void> {
    for (const row of await this.raw('Column')
      .aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])
      .toArray()) {
      report.columnsByLegacyStatus[String(row._id ?? '(none)')] = row.n;
    }

    // Column.status only ever held BoardStatus values, which are now owned by
    // the board itself; anything else would be data we have not accounted for.
    const unexpected = Object.keys(report.columnsByLegacyStatus).filter(
      (value) =>
        value !== '(none)' &&
        !Object.values(BoardStatus).includes(value as BoardStatus),
    );
    if (unexpected.length > 0) {
      throw new Error(
        `Unexpected column status values: ${unexpected.join(', ')}. Review before migrating.`,
      );
    }

    const knownCodes = new Set<string>(Object.values(CardStatus));
    for (const row of await this.raw('Card')
      .aggregate([
        { $match: { statusId: { $exists: false } } },
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ])
      .toArray()) {
      const value = String(row._id ?? '(none)');
      report.cardsByLegacyStatus[value] = row.n;
      const code = toStatusCode(row._id);
      if (!code || !knownCodes.has(code)) {
        report.unknownCardStatuses[value] = row.n;
      }
    }
  }

  private async plan(report: MigrationReport): Promise<ProjectPlan[]> {
    const plans: ProjectPlan[] = [];
    const now = new Date();

    for (const project of await this.raw('Project').find().toArray()) {
      const projectId = project._id as Types.ObjectId;
      let statuses = (await this.raw('Status')
        .find({ projectId })
        .sort({ order: 1 })
        .toArray()) as Doc[];
      let newStatuses: Doc[] = [];

      if (statuses.length === 0) {
        newStatuses = buildDefaultStatuses(projectId.toString()).map(
          (definition) => ({
            ...definition,
            _id: new Types.ObjectId(),
            projectId,
            version: 1,
            createdAt: now,
            updatedAt: now,
          }),
        );
        statuses = newStatuses;
        report.statusesCreated += newStatuses.length;
      }

      const planStatuses: PlanStatus[] = statuses.map((s) => ({
        id: s._id.toString(),
        code: s.code,
        name: s.name,
        order: s.order,
        isDefault: s.isDefault,
      }));

      const projectPlan: ProjectPlan = { projectId, newStatuses, boards: [] };

      for (const board of await this.raw('Board')
        .find({ projectId })
        .toArray()) {
        const boardId = board._id as Types.ObjectId;
        const existingMappings = await this.raw('ColumnStatus')
          .find({ boardId })
          .toArray();

        let columns = (await this.raw('Column')
          .find({ boardId })
          .toArray()) as Doc[];
        let newColumns: Doc[] = [];
        if (columns.length === 0) {
          newColumns = DEFAULT_COLUMNS.map((definition, order) => ({
            _id: new Types.ObjectId(),
            boardId,
            name: definition.name,
            order,
            version: 1,
            createdAt: now,
            updatedAt: now,
          }));
          columns = newColumns;
          report.columnsCreated += newColumns.length;
        }

        const cards = (await this.raw('Card')
          .find({
            columnId: { $in: columns.map((c) => c._id) },
            statusId: { $exists: false },
          })
          .toArray()) as Doc[];

        if (existingMappings.length > 0 && cards.length === 0) {
          continue;
        }

        const plan = newColumns.length
          ? this.defaultBoardPlan(newColumns, planStatuses)
          : planBoard(
              columns.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                order: c.order,
              })),
              planStatuses,
              cards.map((c) => ({
                id: c._id.toString(),
                columnId: c.columnId.toString(),
                legacyStatus: c.status,
              })),
              existingMappings.map((m) => ({
                statusId: m.statusId.toString(),
                columnId: m.columnId.toString(),
              })),
            );

        report.mappingsCreated += plan.mappings.length;
        report.cardsUpdated += plan.cards.length;
        for (const mapping of plan.mappings) {
          report.mappingReasons[mapping.reason] =
            (report.mappingReasons[mapping.reason] ?? 0) + 1;
        }
        for (const card of plan.cards.filter(
          (c) => c.adjustedFrom !== undefined,
        )) {
          const to = planStatuses.find((s) => s.id === card.statusId)!.code;
          if (card.adjustedFrom !== to) {
            report.cardsAdjusted.push({
              cardId: card.cardId,
              from: card.adjustedFrom,
              to,
            });
          }
        }

        projectPlan.boards.push({ boardId, newColumns, plan });
      }

      plans.push(projectPlan);
    }

    return plans;
  }

  /** New default columns get exactly the mapping a newly created board gets. */
  private defaultBoardPlan(columns: Doc[], statuses: PlanStatus[]): BoardPlan {
    const statusByCode = new Map(statuses.map((s) => [s.code, s]));
    const mappings = DEFAULT_COLUMNS.flatMap((definition, index) =>
      definition.statusCodes
        .map((code) => statusByCode.get(code))
        .filter((s): s is PlanStatus => s !== undefined)
        .map((status, order) => ({
          statusId: status.id,
          columnId: columns[index]._id.toString(),
          order,
          reason: 'column-name' as const,
        })),
    );
    return { mappings, cards: [], unresolvedCardIds: [] };
  }

  private async applyProject(
    project: ProjectPlan,
    session?: ClientSession,
  ): Promise<void> {
    const now = new Date();

    if (project.newStatuses.length > 0) {
      await this.raw('Status').insertMany(project.newStatuses, { session });
    }

    for (const board of project.boards) {
      if (board.newColumns.length > 0) {
        await this.raw('Column').insertMany(board.newColumns, { session });
      }

      if (board.plan.mappings.length > 0) {
        await this.raw('ColumnStatus').insertMany(
          board.plan.mappings.map((mapping) => ({
            boardId: board.boardId,
            columnId: new Types.ObjectId(mapping.columnId),
            statusId: new Types.ObjectId(mapping.statusId),
            order: mapping.order,
            createdAt: now,
            updatedAt: now,
          })),
          { session },
        );
      }

      if (board.plan.cards.length === 0) continue;

      const cardIds = board.plan.cards.map((c) => new Types.ObjectId(c.cardId));
      const legacy = await this.raw('Card')
        .find(
          { _id: { $in: cardIds }, status: { $exists: true } },
          { session, projection: { status: 1 } },
        )
        .toArray();
      await this.backup('cards', 'status', legacy, session);

      await this.raw('Card').bulkWrite(
        board.plan.cards.map((card) => ({
          updateOne: {
            filter: {
              _id: new Types.ObjectId(card.cardId),
              statusId: { $exists: false },
            },
            update: {
              $set: { statusId: new Types.ObjectId(card.statusId) },
              $unset: { status: '' },
            },
          },
        })),
        { session },
      );
    }
  }

  private async removeColumnStatusField(
    session?: ClientSession,
  ): Promise<void> {
    const filter = { status: { $exists: true } };
    const legacy = await this.raw('Column')
      .find(filter, { session, projection: { status: 1 } })
      .toArray();
    await this.backup('columns', 'status', legacy, session);
    await this.raw('Column').updateMany(
      filter,
      { $unset: { status: '' } },
      { session },
    );
  }

  /** Grants status permissions to every role that holds the matching column permission. */
  private async seedPermissions(
    report: MigrationReport,
    session?: ClientSession,
  ): Promise<void> {
    const permissions = this.raw('Permission');
    const rolePermissions = this.raw('RolePermission');
    const now = new Date();

    for (const [columnCode, statusCode] of STATUS_PERMISSIONS) {
      const upsert = await permissions.updateOne(
        { code: statusCode },
        {
          $setOnInsert: {
            code: statusCode,
            status: PermissionStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true, session },
      );
      report.permissionsCreated += upsert.upsertedCount;

      const statusPermission = await permissions.findOne(
        { code: statusCode },
        { session },
      );
      const columnPermission = await permissions.findOne(
        { code: columnCode },
        { session },
      );
      if (!statusPermission || !columnPermission) continue;

      const roleIds = await rolePermissions.distinct(
        'roleId',
        { permissionId: columnPermission._id },
        { session },
      );
      for (const roleId of roleIds) {
        const grant = await rolePermissions.updateOne(
          { roleId, permissionId: statusPermission._id },
          {
            $setOnInsert: {
              roleId,
              permissionId: statusPermission._id,
              createdAt: now,
              updatedAt: now,
            },
          },
          { upsert: true, session },
        );
        report.rolePermissionsCreated += grant.upsertedCount;
      }
    }
  }

  private async backup(
    collection: string,
    field: string,
    docs: Array<Record<string, any>>,
    session?: ClientSession,
  ) {
    if (docs.length === 0) return;
    await this.database
      .getClient()
      .collection(BACKUP_COLLECTION)
      .insertMany(
        docs.map((doc) => ({
          migration: MIGRATION_ID,
          collection,
          documentId: doc._id,
          field,
          value: doc[field],
          createdAt: new Date(),
        })),
        { session },
      );
  }

  private async withSession(
    transactional: boolean,
    work: (session?: ClientSession) => Promise<void>,
  ) {
    if (!transactional) {
      return work(undefined);
    }

    const session = await this.database.getClient().startSession();
    try {
      await session.withTransaction(() => work(session));
    } finally {
      await session.endSession();
    }
  }

  private async supportsTransactions(): Promise<boolean> {
    const hello = await this.database
      .getClient()
      .db!.admin()
      .command({ hello: 1 });
    return Boolean(hello.setName) || hello.msg === 'isdbgrid';
  }

  private async countAggregate(
    collection: Collection,
    pipeline: object[],
  ): Promise<number> {
    const [result] = await collection
      .aggregate([...pipeline, { $count: 'n' }])
      .toArray();
    return result?.n ?? 0;
  }

  private raw(model: string): Collection {
    return this.database.getClient().model(model)
      .collection as unknown as Collection;
  }

  private name(model: string): string {
    return this.database.getClient().model(model).collection.collectionName;
  }

  private emptyReport(
    dryRun: boolean,
    transactional: boolean,
  ): MigrationReport {
    return {
      dryRun,
      transactional,
      columnsByLegacyStatus: {},
      cardsByLegacyStatus: {},
      unknownCardStatuses: {},
      statusesCreated: 0,
      columnsCreated: 0,
      mappingsCreated: 0,
      cardsUpdated: 0,
      cardsAdjusted: [],
      mappingReasons: {},
      permissionsCreated: 0,
      rolePermissionsCreated: 0,
    };
  }
}
