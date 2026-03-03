import { 
  validatePaginationParams, 
  validateFilterParams, 
  buildWhereClause 
} from './validation';

describe('Validation Functions', () => {
  describe('validatePaginationParams', () => {
    test('should return default values when no parameters provided', () => {
      const result = validatePaginationParams(null, null);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should parse valid page and limit parameters', () => {
      const result = validatePaginationParams('3', '25');
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    test('should enforce maximum limit of 100', () => {
      const result = validatePaginationParams('1', '200');
      expect(result.limit).toBe(100);
    });

    test('should default to 1 for invalid page values', () => {
      const result = validatePaginationParams('invalid', '10');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should default to 10 for invalid limit values', () => {
      const result = validatePaginationParams('2', 'invalid');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    test('should handle negative page numbers by defaulting to 1', () => {
      const result = validatePaginationParams('-5', '10');
      expect(result.page).toBe(1);
    });

    test('should handle negative limit numbers by defaulting to 10', () => {
      const result = validatePaginationParams('1', '-20');
      expect(result.limit).toBe(10);
    });
  });

  describe('validateFilterParams', () => {
    test('should extract search parameter', () => {
      const searchParams = new URLSearchParams({ search: 'John' });
      const result = validateFilterParams(searchParams);
      expect(result.search).toBe('John');
    });

    test('should extract valid gender parameter', () => {
      const searchParams = new URLSearchParams({ gender: 'Male' });
      const result = validateFilterParams(searchParams);
      expect(result.gender).toBe('Male');
    });

    test('should sanitize search parameter by removing SQL special characters', () => {
      const searchParams = new URLSearchParams({ search: 'John%;' });
      const result = validateFilterParams(searchParams);
      expect(result.search).toBe('John');
    });

    test('should ignore invalid gender values', () => {
      const searchParams = new URLSearchParams({ gender: 'InvalidGender' });
      const result = validateFilterParams(searchParams);
      expect(result.gender).toBeUndefined();
    });

    test('should trim whitespace from search parameter', () => {
      const searchParams = new URLSearchParams({ search: '  John  ' });
      const result = validateFilterParams(searchParams);
      expect(result.search).toBe('John');
    });

    test('should accept all valid gender values', () => {
      ['Male', 'Female', 'Other'].forEach(gender => {
        const searchParams = new URLSearchParams({ gender });
        const result = validateFilterParams(searchParams);
        expect(result.gender).toBe(gender);
      });
    });
  });

  describe('buildWhereClause', () => {
    test('should return empty clause when no filters provided', () => {
      const result = buildWhereClause({});
      expect(result.clause).toBe('');
      expect(result.params).toEqual([]);
    });

    test('should build WHERE clause for search filter', () => {
      const result = buildWhereClause({ search: 'John' });
      expect(result.clause).toContain('WHERE');
      expect(result.clause).toContain('first_name LIKE ?');
      expect(result.params).toEqual(['%John%', '%John%', '%John%']);
    });

    test('should build WHERE clause for gender filter', () => {
      const result = buildWhereClause({ gender: 'Male' });
      expect(result.clause).toBe('WHERE gender = ?');
      expect(result.params).toEqual(['Male']);
    });

    test('should combine multiple filters with AND', () => {
      const result = buildWhereClause({ search: 'John', gender: 'Male' });
      expect(result.clause).toContain('WHERE');
      expect(result.clause).toContain('AND');
      expect(result.params).toEqual(['%John%', '%John%', '%John%', 'Male']);
    });
  });
});
