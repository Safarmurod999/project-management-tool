import { CardStatus } from 'src/infrastructure/common/enum';
import { DEFAULT_COLUMNS } from 'src/domain/statuses/defaults';

/**
 * Pure planning logic for migration 001 (CardStatus enum -> dynamic statuses).
 * Kept free of database access so the mapping rules can be unit-tested.
 */

export interface PlanColumn {
  id: string;
  name: string;
  order: number;
}

export interface PlanStatus {
  id: string;
  code: string;
  name: string;
  order: number;
  isDefault: boolean;
}

export interface PlanCard {
  id: string;
  columnId: string;
  /** Raw legacy `status` value as stored, possibly missing or obsolete. */
  legacyStatus: unknown;
}

export type MappingReason =
  | 'cards'
  | 'column-name'
  | 'status-group'
  | 'first-column';

export interface PlannedMapping {
  statusId: string;
  columnId: string;
  order: number;
  reason: MappingReason;
}

export interface PlannedCardStatus {
  cardId: string;
  statusId: string;
  /** Set when the card could not keep the status matching its legacy value. */
  adjustedFrom?: string;
}

export interface BoardPlan {
  mappings: PlannedMapping[];
  cards: PlannedCardStatus[];
  /** Cards whose column ends up with no statuses; the migration must abort. */
  unresolvedCardIds: string[];
}

/** Legacy enum values that no longer exist, mapped to their replacement code. */
export const LEGACY_STATUS_ALIASES: Record<string, CardStatus> = {
  archived: CardStatus.DONE,
};

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/** Maps a stored legacy status value to a status code, or null if unknown. */
export function toStatusCode(legacyStatus: unknown): string | null {
  if (typeof legacyStatus !== 'string' || legacyStatus.length === 0) {
    return null;
  }

  return LEGACY_STATUS_ALIASES[legacyStatus] ?? legacyStatus;
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[b.length];
}

/**
 * Scores how well a column name describes a status: 3 exact, 2 near-miss
 * typo ("inn progress"), 1 word prefix ("to test" -> testing, "reject" ->
 * rejected), 0 no match.
 */
export function columnNameScore(
  columnName: string,
  status: Pick<PlanStatus, 'code' | 'name'>,
): number {
  const column = normalize(columnName);
  const candidates = [status.code, normalize(status.name)];

  if (candidates.includes(column)) return 3;
  // Short words are too close to each other ("doing" vs "done") for 2 edits.
  const maxEdits = column.length >= 8 ? 2 : 1;
  if (
    column.length >= 5 &&
    candidates.some((c) => editDistance(column, c) <= maxEdits)
  )
    return 2;

  const statusWords = candidates.flatMap((c) => c.split('_'));
  const columnWords = column.split('_').filter((word) => word.length >= 4);
  if (columnWords.some((word) => statusWords.some((s) => s.startsWith(word))))
    return 1;

  return 0;
}

/**
 * Plans status mappings for a board that has existing columns but no
 * ColumnStatus records, and the status each existing card should receive.
 *
 * Every project status is mapped to exactly one column, choosing in order:
 *  1. a column whose name matches the status (see `columnNameScore`),
 *  2. the column that holds most cards with that legacy status,
 *  3. the column of a sibling from the same default group (To Do / In Progress / Done),
 *  4. the first column of the board.
 * A card keeps its legacy status when that status lands in the card's column;
 * otherwise it gets the column's default (or first) status.
 */
export function planBoard(
  columns: PlanColumn[],
  statuses: PlanStatus[],
  cards: PlanCard[],
  /**
   * Mappings already stored for the board (e.g. after an interrupted run).
   * When present they are kept as-is and only cards are planned.
   */
  existingMappings: Array<{ statusId: string; columnId: string }> = [],
): BoardPlan {
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);
  const statusByCode = new Map(sortedStatuses.map((s) => [s.code, s]));
  const columnOrder = new Map(sortedColumns.map((c, i) => [c.id, i]));
  const defaultStatus =
    sortedStatuses.find((s) => s.isDefault) ?? sortedStatuses[0];

  const assigned = new Map<
    string,
    { columnId: string; reason: MappingReason }
  >();

  if (sortedColumns.length === 0 || sortedStatuses.length === 0) {
    return {
      mappings: [],
      cards: [],
      unresolvedCardIds: cards.map((card) => card.id),
    };
  }

  const legacyStatusOf = (card: PlanCard): PlanStatus | undefined => {
    const code = toStatusCode(card.legacyStatus);
    return (code ? statusByCode.get(code) : undefined) ?? defaultStatus;
  };

  if (existingMappings.length > 0) {
    const statusById = new Map(sortedStatuses.map((s) => [s.id, s]));
    for (const mapping of existingMappings) {
      assigned.set(mapping.statusId, {
        columnId: mapping.columnId,
        reason: 'cards',
      });
    }
    const statusesByColumn = new Map<string, PlanStatus[]>();
    for (const mapping of existingMappings) {
      const status = statusById.get(mapping.statusId);
      if (!status) continue;
      statusesByColumn.set(mapping.columnId, [
        ...(statusesByColumn.get(mapping.columnId) ?? []),
        status,
      ]);
    }
    return {
      mappings: [],
      ...planCards(cards, assigned, statusesByColumn, legacyStatusOf),
    };
  }

  // 1. Column names: best score wins, ties go to the leftmost column.
  for (const status of sortedStatuses) {
    let best: { column: PlanColumn; score: number } | null = null;
    for (const column of sortedColumns) {
      const score = columnNameScore(column.name, status);
      if (score > 0 && (!best || score > best.score)) best = { column, score };
    }
    if (best)
      assigned.set(status.id, {
        columnId: best.column.id,
        reason: 'column-name',
      });
  }

  // 2. Card evidence: majority column per remaining status. Legacy statuses
  // were not always kept in sync with columns, so this ranks below names.
  const counts = new Map<string, Map<string, number>>();
  for (const card of cards) {
    if (!columnOrder.has(card.columnId)) continue;
    const status = legacyStatusOf(card);
    if (!status || assigned.has(status.id)) continue;
    const perColumn = counts.get(status.id) ?? new Map<string, number>();
    perColumn.set(card.columnId, (perColumn.get(card.columnId) ?? 0) + 1);
    counts.set(status.id, perColumn);
  }
  for (const [statusId, perColumn] of counts) {
    const [columnId] = [...perColumn.entries()].sort(
      (a, b) => b[1] - a[1] || columnOrder.get(a[0])! - columnOrder.get(b[0])!,
    )[0];
    assigned.set(statusId, { columnId, reason: 'cards' });
  }

  // 3. Siblings from the same default group.
  for (const group of DEFAULT_COLUMNS) {
    const groupStatuses = group.statusCodes
      .map((code) => statusByCode.get(code))
      .filter((s): s is PlanStatus => s !== undefined);
    const anchor = groupStatuses.find((s) => assigned.has(s.id));
    if (!anchor) continue;
    for (const status of groupStatuses) {
      if (!assigned.has(status.id)) {
        assigned.set(status.id, {
          columnId: assigned.get(anchor.id)!.columnId,
          reason: 'status-group',
        });
      }
    }
  }

  // 4. Everything else goes to the first column.
  for (const status of sortedStatuses) {
    if (!assigned.has(status.id)) {
      assigned.set(status.id, {
        columnId: sortedColumns[0].id,
        reason: 'first-column',
      });
    }
  }

  const mappings: PlannedMapping[] = [];
  const statusesByColumn = new Map<string, PlanStatus[]>();
  for (const status of sortedStatuses) {
    const { columnId, reason } = assigned.get(status.id)!;
    const columnStatuses = statusesByColumn.get(columnId) ?? [];
    mappings.push({
      statusId: status.id,
      columnId,
      order: columnStatuses.length,
      reason,
    });
    columnStatuses.push(status);
    statusesByColumn.set(columnId, columnStatuses);
  }

  return {
    mappings,
    ...planCards(cards, assigned, statusesByColumn, legacyStatusOf),
  };
}

function planCards(
  cards: PlanCard[],
  assigned: Map<string, { columnId: string }>,
  statusesByColumn: Map<string, PlanStatus[]>,
  legacyStatusOf: (card: PlanCard) => PlanStatus | undefined,
): Pick<BoardPlan, 'cards' | 'unresolvedCardIds'> {
  const plannedCards: PlannedCardStatus[] = [];
  const unresolvedCardIds: string[] = [];

  for (const card of cards) {
    const legacy = legacyStatusOf(card);
    const columnStatuses = statusesByColumn.get(card.columnId) ?? [];

    if (legacy && assigned.get(legacy.id)?.columnId === card.columnId) {
      plannedCards.push({ cardId: card.id, statusId: legacy.id });
      continue;
    }

    const fallback =
      columnStatuses.find((s) => s.isDefault) ?? columnStatuses[0];
    if (!fallback) {
      unresolvedCardIds.push(card.id);
      continue;
    }

    plannedCards.push({
      cardId: card.id,
      statusId: fallback.id,
      adjustedFrom: legacy?.code,
    });
  }

  return { cards: plannedCards, unresolvedCardIds };
}
