import { WorkflowFactoryImpl } from './factory';

describe('WorkflowFactoryImpl', () => {
  const factory = new WorkflowFactoryImpl();

  it('trims fields and applies defaults for a new workflow', () => {
    expect(
      factory.create({
        projectId: 'p1',
        name: '  Delivery ',
        description: ' ',
      }),
    ).toMatchObject({
      projectId: 'p1',
      name: 'Delivery',
      description: null,
      isDefault: false,
      version: 1,
      updatedAt: null,
    });
  });

  it.each(['', '   '])('rejects the name %j', (name) => {
    expect(() => factory.create({ projectId: 'p1', name })).toThrow(
      /name is invalid/i,
    );
  });

  it('validates only the fields that are present', () => {
    expect(() => factory.validate({})).not.toThrow();
    expect(() => factory.validate({ name: ' ' })).toThrow(/name is invalid/i);
  });
});
