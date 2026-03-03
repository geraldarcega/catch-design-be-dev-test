import { GET } from './route';
import { getDatabase } from '@/lib/db';
import { NextRequest } from 'next/server';
import { Customer } from '@/types/customer';

// Mock the database module
jest.mock('@/lib/db');

// Mock customer data for testing
const mockCustomers: Customer[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    gender: 'Male',
    ip_address: '192.168.1.1',
    company: 'Acme Corp',
    city: 'New York',
    title: 'Developer',
    website: 'https://example.com'
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    gender: 'Female',
    ip_address: '192.168.1.2',
    company: 'Tech Inc',
    city: 'San Francisco',
    title: 'Designer',
    website: 'https://example2.com'
  },
  {
    id: '3',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob.j@example.com',
    gender: 'Male',
    ip_address: '192.168.1.3',
    company: 'StartupXYZ',
    city: 'Austin',
    title: 'Manager',
    website: 'https://example3.com'
  }
];

describe('GET /api/customers - Comprehensive Tests', () => {
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock database with common methods
    mockDb = {
      get: jest.fn(),
      all: jest.fn(),
    };

    (getDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  /**
   * Helper function to create a NextRequest with query parameters
   */
  const createRequest = (params: Record<string, string> = {}): NextRequest => {
    const url = new URL('http://localhost:3000/api/customers');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return new NextRequest(url);
  };

  describe('Successful Responses', () => {
    test('should return customers with default pagination', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockCustomers);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
      });
    });

    test('should return customers with custom pagination', async () => {
      mockDb.get.mockResolvedValue({ total: 50 });
      mockDb.all.mockResolvedValue(mockCustomers.slice(0, 2));

      const request = createRequest({ page: '2', limit: '2' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.total).toBe(50);
      expect(data.pagination.totalPages).toBe(25);
      expect(data.pagination.hasNext).toBe(true);
      expect(data.pagination.hasPrevious).toBe(true);
    });

    test('should include Cache-Control header', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest();
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('private, max-age=60');
    });
  });

  describe('Pagination Scenarios', () => {
    test('should handle first page correctly', async () => {
      mockDb.get.mockResolvedValue({ total: 30 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ page: '1', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.page).toBe(1);
      expect(data.pagination.hasNext).toBe(true);
      expect(data.pagination.hasPrevious).toBe(false);
      
      // Verify correct LIMIT and OFFSET were used
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.any(String),
        [10, 0] // limit, offset
      );
    });

    test('should handle middle page correctly', async () => {
      mockDb.get.mockResolvedValue({ total: 50 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ page: '3', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.page).toBe(3);
      expect(data.pagination.hasNext).toBe(true);
      expect(data.pagination.hasPrevious).toBe(true);
      
      // Verify correct offset calculation (page 3 with limit 10 = offset 20)
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.any(String),
        [10, 20] // limit, offset
      );
    });

    test('should handle last page correctly', async () => {
      mockDb.get.mockResolvedValue({ total: 25 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ page: '3', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.page).toBe(3);
      expect(data.pagination.totalPages).toBe(3);
      expect(data.pagination.hasNext).toBe(false);
      expect(data.pagination.hasPrevious).toBe(true);
    });

    test('should enforce maximum limit of 100', async () => {
      mockDb.get.mockResolvedValue({ total: 500 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ limit: '1000' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.limit).toBe(100);
      
      // Verify database was called with max limit
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.any(String),
        [100, 0]
      );
    });

    test('should handle empty results', async () => {
      mockDb.get.mockResolvedValue({ total: 0 });
      mockDb.all.mockResolvedValue([]);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
      expect(data.pagination.totalPages).toBe(0);
    });
  });

  describe('Search Filtering', () => {
    test('should filter by search term', async () => {
      const filteredCustomers = [mockCustomers[0]];
      mockDb.get.mockResolvedValue({ total: 1 });
      mockDb.all.mockResolvedValue(filteredCustomers);

      const request = createRequest({ search: 'John' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.total).toBe(1);
      
      // Verify search query was built correctly
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[0]).toContain('WHERE');
      expect(countCall[0]).toContain('first_name LIKE ?');
      expect(countCall[1]).toEqual(['%John%', '%John%', '%John%']);
    });

    test('should sanitize search input by removing SQL special characters', async () => {
      mockDb.get.mockResolvedValue({ total: 0 });
      mockDb.all.mockResolvedValue([]);

      const request = createRequest({ search: 'John%;DROP TABLE' });
      const response = await GET(request);

      // Verify the search was sanitized (% and ; removed)
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[1][0]).toBe('%JohnDROP TABLE%');
      expect(response.status).toBe(200);
    });

    test('should trim whitespace from search term', async () => {
      mockDb.get.mockResolvedValue({ total: 0 });
      mockDb.all.mockResolvedValue([]);

      const request = createRequest({ search: '  John  ' });
      await GET(request);

      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[1][0]).toBe('%John%');
    });
  });

  describe('Gender Filtering', () => {
    test('should filter by valid gender (Male)', async () => {
      const maleCustomers = mockCustomers.filter(c => c.gender === 'Male');
      mockDb.get.mockResolvedValue({ total: 2 });
      mockDb.all.mockResolvedValue(maleCustomers);

      const request = createRequest({ gender: 'Male' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify gender filter was applied
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[0]).toContain('gender = ?');
      expect(countCall[1]).toContain('Male');
    });

    test('should filter by valid gender (Female)', async () => {
      const femaleCustomers = mockCustomers.filter(c => c.gender === 'Female');
      mockDb.get.mockResolvedValue({ total: 1 });
      mockDb.all.mockResolvedValue(femaleCustomers);

      const request = createRequest({ gender: 'Female' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[1]).toContain('Female');
    });

    test('should ignore invalid gender values', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ gender: 'InvalidGender' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // Verify no gender filter was applied
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[0]).not.toContain('gender = ?');
    });
  });

  describe('Combined Filters', () => {
    test('should combine search and gender filters with AND', async () => {
      mockDb.get.mockResolvedValue({ total: 1 });
      mockDb.all.mockResolvedValue([mockCustomers[0]]);

      const request = createRequest({ search: 'John', gender: 'Male' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // Verify both filters were applied with AND
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[0]).toContain('WHERE');
      expect(countCall[0]).toContain('AND');
      expect(countCall[0]).toContain('first_name LIKE ?');
      expect(countCall[0]).toContain('gender = ?');
      expect(countCall[1]).toEqual(['%John%', '%John%', '%John%', 'Male']);
    });

    test('should combine search, gender, and pagination', async () => {
      mockDb.get.mockResolvedValue({ total: 10 });
      mockDb.all.mockResolvedValue([mockCustomers[0]]);

      const request = createRequest({ 
        search: 'John', 
        gender: 'Male',
        page: '2',
        limit: '5'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
      
      // Verify filters and pagination
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.any(String),
        ['%John%', '%John%', '%John%', 'Male', 5, 5] // filters + limit + offset
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection error', async () => {
      (getDatabase as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch customers');
      expect(data.message).toBe('Database connection failed');
    });

    test('should handle database query error', async () => {
      mockDb.get.mockRejectedValue(new Error('Query failed'));

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch customers');
      expect(data.message).toBe('Query failed');
    });

    test('should handle non-Error exceptions', async () => {
      mockDb.get.mockRejectedValue('String error');

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch customers');
      expect(data.message).toBe('Unknown error');
    });

    test('should handle null count result', async () => {
      mockDb.get.mockResolvedValue(null);
      mockDb.all.mockResolvedValue([]);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.total).toBe(0);
    });
  });

  describe('Input Validation Edge Cases', () => {
    test('should handle negative page number', async () => {
      mockDb.get.mockResolvedValue({ total: 10 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ page: '-1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1); // Should default to 1
    });

    test('should handle zero limit', async () => {
      mockDb.get.mockResolvedValue({ total: 10 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ limit: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.limit).toBe(10); // Should default to 10
    });

    test('should handle non-numeric page parameter', async () => {
      mockDb.get.mockResolvedValue({ total: 10 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ page: 'abc' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1);
    });

    test('should handle empty search string', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ search: '' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // Verify no search filter was applied
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[0]).not.toContain('LIKE');
    });

    test('should handle whitespace-only search string', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ search: '   ' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // After trimming, empty string should not create a filter
      const countCall = mockDb.get.mock.calls[0];
      expect(countCall[0]).not.toContain('LIKE');
    });
  });

  describe('Response Structure Validation', () => {
    test('should return correct response structure', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      // Verify response structure
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      
      // Verify pagination structure
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(data.pagination).toHaveProperty('hasNext');
      expect(data.pagination).toHaveProperty('hasPrevious');
    });

    test('should return customers with all required fields', async () => {
      mockDb.get.mockResolvedValue({ total: 1 });
      mockDb.all.mockResolvedValue([mockCustomers[0]]);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      const customer = data.data[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('first_name');
      expect(customer).toHaveProperty('last_name');
      expect(customer).toHaveProperty('email');
      expect(customer).toHaveProperty('gender');
      expect(customer).toHaveProperty('ip_address');
      expect(customer).toHaveProperty('company');
      expect(customer).toHaveProperty('city');
      expect(customer).toHaveProperty('title');
      expect(customer).toHaveProperty('website');
    });
  });

  describe('Database Query Verification', () => {
    test('should call both COUNT and data queries', async () => {
      mockDb.get.mockResolvedValue({ total: 10 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest();
      await GET(request);

      expect(mockDb.get).toHaveBeenCalledTimes(1);
      expect(mockDb.all).toHaveBeenCalledTimes(1);
    });

    test('should select correct columns in data query', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest();
      await GET(request);

      const dataQuery = mockDb.all.mock.calls[0][0];
      expect(dataQuery).toContain('SELECT id, first_name, last_name, email, gender');
      expect(dataQuery).toContain('ip_address, company, city, title, website');
    });

    test('should order results by id', async () => {
      mockDb.get.mockResolvedValue({ total: 3 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest();
      await GET(request);

      const dataQuery = mockDb.all.mock.calls[0][0];
      expect(dataQuery).toContain('ORDER BY id');
    });

    test('should apply LIMIT and OFFSET in correct order', async () => {
      mockDb.get.mockResolvedValue({ total: 50 });
      mockDb.all.mockResolvedValue(mockCustomers);

      const request = createRequest({ page: '3', limit: '15' });
      await GET(request);

      const dataQuery = mockDb.all.mock.calls[0][0];
      expect(dataQuery).toContain('LIMIT ? OFFSET ?');
      
      const params = mockDb.all.mock.calls[0][1];
      const limitValue = params[params.length - 2];
      const offsetValue = params[params.length - 1];
      
      expect(limitValue).toBe(15);
      expect(offsetValue).toBe(30); // (3-1) * 15
    });
  });
});
