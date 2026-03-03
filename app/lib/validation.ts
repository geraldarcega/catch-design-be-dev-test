import { FilterParams, PaginationParams } from '@/types/customer';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/**
 * Validate and sanitize pagination parameters
 */
export function validatePaginationParams(
  page?: string | null,
  limit?: string | null
): PaginationParams {
  const parsedPage = parseInt(page || String(DEFAULT_PAGE), 10);
  const parsedLimit = parseInt(limit || String(DEFAULT_LIMIT), 10);

  return {
    page: isNaN(parsedPage) || parsedPage < 1 ? DEFAULT_PAGE : parsedPage,
    limit: isNaN(parsedLimit) || parsedLimit < 1 
      ? DEFAULT_LIMIT 
      : Math.min(parsedLimit, MAX_LIMIT)
  };
}

/**
 * Validate and sanitize filter parameters
 */
export function validateFilterParams(searchParams: URLSearchParams): FilterParams {
  const filters: FilterParams = {};

  // Sanitize search query - remove special SQL characters
  const search = searchParams.get('search');
  if (search) {
    filters.search = search.trim().replace(/[%;]/g, '');
  }

  // Validate gender filter
  const gender = searchParams.get('gender');
  if (gender && ['Male', 'Female', 'Other'].includes(gender)) {
    filters.gender = gender;
  }

  return filters;
}

/**
 * Build safe WHERE clause for SQL query
 */
export function buildWhereClause(filters: FilterParams): { 
  clause: string; 
  params: (string | number)[] 
} {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.search) {
    conditions.push(
      'first_name LIKE ? OR last_name LIKE ? OR email LIKE ?'
    );
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (filters.gender) {
    conditions.push('gender = ?');
    params.push(filters.gender);
  }

  const clause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  return { clause, params };
}