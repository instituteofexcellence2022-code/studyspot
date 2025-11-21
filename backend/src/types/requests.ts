// ============================================
// REQUEST TYPE DEFINITIONS
// Type-safe request interfaces for all services
// ============================================

import { FastifyRequest } from 'fastify';
import { AuthenticatedRequest } from '../middleware/auth';

// Base request types
export interface BaseParams {
  id?: string;
  [key: string]: string | undefined;
}

export interface BaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface BaseBody {
  [key: string]: unknown;
}

// Student Service Request Types
export interface StudentParams extends BaseParams {
  id: string;
}

export interface StudentQuery extends BaseQuery {
  status?: string;
  library_id?: string;
  search?: string;
}

export interface CreateStudentBody {
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  parent_phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  education_level?: string;
  course?: string;
  institution?: string;
  library_id?: string;
}

export interface UpdateStudentBody extends Partial<CreateStudentBody> {
  status?: 'active' | 'suspended' | 'inactive';
}

// Library Service Request Types
export interface LibraryParams extends BaseParams {
  id: string;
}

export interface LibraryQuery extends BaseQuery {
  status?: string;
  city?: string;
  state?: string;
  search?: string;
}

export interface CreateLibraryBody {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  capacity: number;
  current_occupancy?: number;
  status?: 'active' | 'inactive';
  fee_plan_id?: string;
}

// Booking Service Request Types
export interface BookingParams extends BaseParams {
  id: string;
}

export interface BookingQuery extends BaseQuery {
  status?: string;
  library_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateBookingBody {
  library_id: string;
  start_time: string;
  end_time: string;
  seat_number?: string;
  notes?: string;
}

// Payment Service Request Types
export interface PaymentParams extends BaseParams {
  id: string;
}

export interface PaymentQuery extends BaseQuery {
  status?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreatePaymentBody {
  amount: number;
  currency?: string;
  payment_method: 'cashfree' | 'razorpay';
  booking_id?: string;
  description?: string;
}

// Generic typed request helpers
export type TypedRequest<TParams = BaseParams, TQuery = BaseQuery, TBody = BaseBody> = 
  AuthenticatedRequest & {
    params: TParams;
    query: TQuery;
    body: TBody;
  };

// Helper function to safely extract typed params
export function getTypedParams<T extends BaseParams>(request: FastifyRequest): T {
  return (request.params || {}) as T;
}

// Helper function to safely extract typed query
export function getTypedQuery<T extends BaseQuery>(request: FastifyRequest): T {
  const query = request.query || {};
  // Convert string numbers to numbers
  const typed: Record<string, unknown> = typeof query === 'object' && query !== null ? { ...query } : {};
  if (typed.page) typed.page = parseInt(typed.page as string) || 1;
  if (typed.limit) typed.limit = parseInt(typed.limit as string) || 20;
  return typed as T;
}

// Helper function to safely extract typed body
export function getTypedBody<T extends BaseBody>(request: FastifyRequest): T {
  return (request.body || {}) as T;
}

