import { normalizePagination } from './pagination';

describe('normalizePagination', () => {
  it.each([
    [{}, { page: 1, limit: 10 }],
    [
      { page: 3, limit: 25 },
      { page: 3, limit: 25 },
    ],
    [{ limit: 500 }, { page: 1, limit: 100 }],
    [
      { page: 0, limit: 0 },
      { page: 1, limit: 10 },
    ],
    [
      { page: -2, limit: -5 },
      { page: 1, limit: 10 },
    ],
    [
      { page: NaN, limit: 2.5 },
      { page: 1, limit: 10 },
    ],
  ])('%j -> %j', (input, expected) => {
    expect(normalizePagination(input)).toEqual(expected);
  });
});
