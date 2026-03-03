export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  ip_address: string;
  company: string;
  city: string;
  title: string;
  website: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search?: string;
  gender?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}