import { StatusFactoryImpl } from './factory';

describe('StatusFactoryImpl', () => {
  const factory = new StatusFactoryImpl();

  it('derives code and defaults for a new status', () => {
    expect(
      factory.create({ projectId: 'p1', name: '  Code Review ' }),
    ).toMatchObject({
      projectId: 'p1',
      name: 'Code Review',
      code: 'code_review',
      color: '#9E9E9E',
      order: 0,
      isDefault: false,
      version: 1,
    });
  });

  it.each([
    [{ name: ' ' }, 'name'],
    [{ name: 'A', code: 'Bad Code' }, 'code'],
    [{ name: 'A', color: 'blue' }, 'color'],
    [{ name: 'A', order: -1 }, 'order'],
  ])('rejects invalid %j', (data, field) => {
    expect(() => factory.create({ projectId: 'p1', ...data })).toThrow(
      new RegExp(field, 'i'),
    );
  });

  it('validates only provided fields on update', () => {
    expect(() => factory.validate({})).not.toThrow();
    expect(() => factory.validate({ color: '#12345' })).toThrow(/color/i);
  });
});
