// ============================================
// BOOKING SERVICE VALIDATION SCHEMAS
// ============================================

import { z } from 'zod';

// UUID validation
const uuidSchema = z.string().uuid('Invalid UUID format');

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
});

// Create Booking Schema
export const createBookingSchema = z.object({
  user_id: uuidSchema,
  library_id: uuidSchema,
  seat_id: uuidSchema.optional().nullable(),
  start_time: z.string().datetime('Invalid datetime format'),
  end_time: z.string().datetime('Invalid datetime format'),
  total_amount: z.coerce.number().nonnegative('Amount must be non-negative'),
  payment_status: z.enum(['pending', 'paid', 'refunded']).optional().default('pending'),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed']).optional().default('pending'),
}).refine((data) => {
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
});

// Update Booking Schema
export const updateBookingSchema = z.object({
  seat_id: uuidSchema.optional().nullable(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  total_amount: z.coerce.number().nonnegative().optional(),
  payment_status: z.enum(['pending', 'paid', 'refunded']).optional(),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed']).optional(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return end > start;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
});

// Get Bookings Query Schema
export const getBookingsQuerySchema = paginationSchema.extend({
  userId: uuidSchema.optional(),
  libraryId: uuidSchema.optional(),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'completed']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Booking Params Schema
export const bookingParamsSchema = z.object({
  id: uuidSchema,
});

// User Bookings Params Schema
export const userBookingsParamsSchema = z.object({
  userId: uuidSchema,
});

// Library Bookings Params Schema
export const libraryBookingsParamsSchema = z.object({
  libraryId: uuidSchema,
});

