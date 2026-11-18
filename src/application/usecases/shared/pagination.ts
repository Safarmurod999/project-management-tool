export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Applies the list defaults (page 1, limit 10) and caps `limit` at 100.
 * Values that are not positive integers fall back to the defaults.
 */
export const normalizePagination = (params: {
  page?: number;
  limit?: number;
}): { page: number; limit: number } => {
  const page =
    Number.isInteger(params.page) && params.page! > 0
      ? params.page!
      : DEFAULT_PAGE;
  const limit =
    Number.isInteger(params.limit) && params.limit! > 0
      ? Math.min(params.limit!, MAX_LIMIT)
      : DEFAULT_LIMIT;

  return { page, limit };
};
