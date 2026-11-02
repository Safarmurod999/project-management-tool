import { DEFAULT_STATUSES } from 'src/domain/statuses/defaults';
import {
  columnNameScore,
  planBoard,
  PlanColumn,
  PlanStatus,
  toStatusCode,
} from './dynamic-statuses.plan';

const statuses: PlanStatus[] = DEFAULT_STATUSES.map((s) => ({
  id: `s-${s.code}`,
  code: s.code,
  name: s.name,
  order: s.order,
  isDefault: s.isDefault,
}));

const columns = (...names: string[]): PlanColumn[] =>
  names.map((name, order) => ({ id: `c-${order}`, name, order }));

const layout = (plan: ReturnType<typeof planBoard>, cols: PlanColumn[]) =>
  Object.fromEntries(
    cols.map((c) => [
      c.name,
      plan.mappings
        .filter((m) => m.columnId === c.id)
        .sort((a, b) => a.order - b.order)
        .map((m) => m.statusId.replace('s-', '')),
    ]),
  );

describe('dynamic statuses migration plan', () => {
  describe('toStatusCode', () => {
    it('maps the removed "archived" value to done and rejects empty values', () => {
      expect(toStatusCode('archived')).toBe('done');
      expect(toStatusCode('todo')).toBe('todo');
      expect(toStatusCode(undefined)).toBeNull();
      expect(toStatusCode('')).toBeNull();
    });
  });

  describe('columnNameScore', () => {
    const status = (code: string) => statuses.find((s) => s.code === code)!;

    it('ranks exact > typo > word prefix > none', () => {
      expect(columnNameScore('In Progress', status('in_progress'))).toBe(3);
      expect(columnNameScore('inn progress', status('in_progress'))).toBe(2);
      expect(columnNameScore('to test', status('testing'))).toBe(1);
      expect(columnNameScore('reject', status('rejected'))).toBe(1);
      expect(columnNameScore('done', status('todo'))).toBe(0);
    });
  });

  it('maps every status exactly once and keeps every card in its column', () => {
    // Mirrors the local dev data: custom columns, legacy statuses out of sync
    // with the columns the cards are in.
    const cols = columns(
      'planning',
      'todo',
      'inn progress',
      'pending',
      'to test',
      'reject',
      'done',
    );
    const plan = planBoard(cols, statuses, [
      { id: 'k1', columnId: 'c-1', legacyStatus: 'todo' },
      { id: 'k2', columnId: 'c-1', legacyStatus: 'in_progress' },
      { id: 'k3', columnId: 'c-2', legacyStatus: 'todo' },
    ]);

    expect(layout(plan, cols)).toEqual({
      planning: ['planning'],
      todo: ['todo'],
      'inn progress': ['in_progress', 'to_realize'],
      pending: ['pending'],
      'to test': ['testing'],
      reject: ['rejected'],
      done: ['done'],
    });
    expect(new Set(plan.mappings.map((m) => m.statusId)).size).toBe(
      statuses.length,
    );
    expect(plan.unresolvedCardIds).toEqual([]);
    expect(plan.cards).toEqual([
      { cardId: 'k1', statusId: 's-todo' },
      { cardId: 'k2', statusId: 's-todo', adjustedFrom: 'in_progress' },
      { cardId: 'k3', statusId: 's-in_progress', adjustedFrom: 'todo' },
    ]);
  });

  it('falls back to card evidence, status groups and the first column', () => {
    const cols = columns('Backlog', 'Doing', 'Shipped');
    const plan = planBoard(cols, statuses, [
      { id: 'k1', columnId: 'c-1', legacyStatus: 'in_progress' },
      { id: 'k2', columnId: 'c-2', legacyStatus: 'done' },
    ]);

    expect(layout(plan, cols)).toEqual({
      Backlog: ['planning', 'todo'],
      Doing: ['in_progress', 'pending', 'testing', 'to_realize'],
      Shipped: ['rejected', 'done'],
    });
    const reasons = Object.fromEntries(
      plan.mappings.map((m) => [m.statusId, m.reason]),
    );
    expect(reasons['s-in_progress']).toBe('cards');
    expect(reasons['s-pending']).toBe('status-group');
    expect(reasons['s-planning']).toBe('first-column');
  });

  it('gives cards with unknown legacy values the column default', () => {
    const cols = columns('To Do', 'Done');
    const plan = planBoard(cols, statuses, [
      { id: 'k1', columnId: 'c-0', legacyStatus: 'mystery' },
      { id: 'k2', columnId: 'c-1', legacyStatus: 'archived' },
    ]);

    expect(plan.cards).toEqual([
      { cardId: 'k1', statusId: 's-todo' },
      { cardId: 'k2', statusId: 's-done' },
    ]);
  });

  it('reports cards whose column would end up without statuses', () => {
    const plan = planBoard(columns('todo', 'Empty'), statuses.slice(0, 2), [
      { id: 'k1', columnId: 'c-1', legacyStatus: 'todo' },
    ]);

    expect(plan.unresolvedCardIds).toEqual(['k1']);
  });

  it('reuses existing mappings and only plans cards on re-runs', () => {
    const cols = columns('A', 'B');
    const plan = planBoard(
      cols,
      statuses,
      [{ id: 'k1', columnId: 'c-1', legacyStatus: 'todo' }],
      [
        { statusId: 's-todo', columnId: 'c-0' },
        { statusId: 's-done', columnId: 'c-1' },
      ],
    );

    expect(plan.mappings).toEqual([]);
    expect(plan.cards).toEqual([
      { cardId: 'k1', statusId: 's-done', adjustedFrom: 'todo' },
    ]);
  });
});
