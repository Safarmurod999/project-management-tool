import { WorkflowTransitionFactoryImpl } from './factory';

describe('WorkflowTransitionFactoryImpl', () => {
  const factory = new WorkflowTransitionFactoryImpl();
  const rule = { workflowId: 'w1', fromStatusId: 'todo', toStatusId: 'done' };

  it('creates a one-way rule', () => {
    expect(factory.createRules(rule)).toEqual([expect.objectContaining(rule)]);
  });

  it('creates a two-way transition as two separate rules', () => {
    expect(factory.createRules(rule, true)).toEqual([
      expect.objectContaining(rule),
      expect.objectContaining({
        workflowId: 'w1',
        fromStatusId: 'done',
        toStatusId: 'todo',
      }),
    ]);
  });

  it('rejects a transition to the same status', () => {
    expect(() =>
      factory.create({ ...rule, toStatusId: rule.fromStatusId }),
    ).toThrow(/same status/i);
  });

  it.each([{ fromStatusId: '' }, { toStatusId: '' }])(
    'rejects a missing status %j',
    (override) => {
      expect(() => factory.create({ ...rule, ...override })).toThrow(
        /requires both/i,
      );
    },
  );
});
