/**
 * Common TypeScript Types for API
 * 
 * Provides standardized types for API requests and responses
 */

// Generic API response
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  meta?: {
    pagination?: PaginationMeta;
    filters?: Record<string, any>;
    timestamp?: string;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  links?: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string | null;
  };
}

// Paginated response
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  meta: {
    pagination: PaginationMeta;
    filters?: Record<string, any>;
    timestamp: string;
  };
}

// Error response
export interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Request parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams, SortParams {
  search?: string;
  [key: string]: any;
}

// Common entity types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface TenantEntity extends BaseEntity {
  tenant_id: string;
}

// Request status
export interface RequestStatus {
  loading: boolean;
  error: ErrorResponse | null;
}

// Async operation result
export interface AsyncResult<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

