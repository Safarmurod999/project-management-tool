/**
 * Reads an optional boolean query parameter. Returns `undefined` when it is
 * absent or empty and `null` when it is neither "true" nor "false".
 */
export const parseBooleanQuery = (
  value: string | undefined,
): boolean | undefined | null => {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
};

/** Reads an optional numeric query parameter (`page`, `limit`). */
export const parseNumberQuery = (
  value: string | number | undefined,
): number | undefined =>
  value === undefined || value === '' ? undefined : Number(value);
