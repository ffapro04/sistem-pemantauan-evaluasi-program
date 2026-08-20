export interface ParsedPagination {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Returns null when neither `page` nor `limit` was sent by the caller, so
// existing endpoints keep returning a bare array unless a caller opts in.
export function parsePagination(
  page?: string,
  limit?: string,
): ParsedPagination | null {
  if (page === undefined && limit === undefined) return null;

  const parsedPage = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const parsedLimit = Math.min(
    200,
    Math.max(1, parseInt(limit ?? '20', 10) || 20),
  );

  return { page: parsedPage, limit: parsedLimit };
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  pagination: ParsedPagination,
): PaginatedResult<T> {
  return { data, total, page: pagination.page, limit: pagination.limit };
}
