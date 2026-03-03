import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { 
  validatePaginationParams, 
  validateFilterParams, 
  buildWhereClause 
} from '@/lib/validation';
import { Customer, PaginatedResponse } from '@/types/customer';

/**
 * GET /api/customers
 * 
 * Query parameters:
 * - page: Page number (default: 1, min: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search by first name, last name, or email
 * - gender: Filter by gender (Male, Female, Other)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate and sanitize input
    const { page, limit } = validatePaginationParams(
      searchParams.get('page'),
      searchParams.get('limit')
    );
    const filters = validateFilterParams(searchParams);

    // Get database connection
    const db = await getDatabase();

    // Build query with filters
    const { clause: whereClause, params: whereParams } = buildWhereClause(filters);
    
    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
    const countResult = await db.get<{ total: number }>(countQuery, whereParams);
    const total = countResult?.total || 0;

    // Get paginated data
    const dataQuery = `
      SELECT id, first_name, last_name, email, gender, ip_address, company, city, title, website 
      FROM customers 
      ${whereClause}
      ORDER BY id 
      LIMIT ? OFFSET ?
    `;
    // for debugging purposes, log the final query and parameters
    // console.log('Executing data query:', dataQuery, [...whereParams, limit, offset]);
    const customers = await db.all<Customer[]>(
      dataQuery, 
      [...whereParams, limit, offset]
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<Customer> = {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch customers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}