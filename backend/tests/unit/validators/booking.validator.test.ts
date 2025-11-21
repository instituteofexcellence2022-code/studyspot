/**
 * UNIT TESTS - BOOKING VALIDATOR
 * Tests for booking validation schemas
 */

import {
  createBookingSchema,
  updateBookingSchema,
  getBookingsQuerySchema,
  bookingParamsSchema,
} from '../../../src/validators/booking.validator';

describe('Booking Validator Schemas', () => {
  describe('createBookingSchema', () => {
    it('should validate valid booking data', () => {
      const validData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        library_id: '123e4567-e89b-12d3-a456-426614174001',
        seat_id: '123e4567-e89b-12d3-a456-426614174002',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:00:00Z',
        total_amount: 100,
      };

      const result = createBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require user_id and library_id', () => {
      const invalidData = {
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:00:00Z',
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject end_time before start_time', () => {
      const invalidData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        library_id: '123e4567-e89b-12d3-a456-426614174001',
        start_time: '2024-01-15T12:00:00Z',
        end_time: '2024-01-15T10:00:00Z', // End before start
        total_amount: 100,
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate date format', () => {
      const invalidData = {
        library_id: '123e4567-e89b-12d3-a456-426614174000',
        start_time: 'invalid-date',
        end_time: '2024-01-15T12:00:00Z',
      };

      const result = createBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBookingSchema', () => {
    it('should validate partial update', () => {
      const validData = {
        status: 'confirmed',
      };

      const result = updateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('getBookingsQuerySchema', () => {
    it('should validate query parameters', () => {
      const validQuery = {
        page: '1',
        limit: '20',
        status: 'confirmed',
        library_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = getBookingsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });
  });

  describe('bookingParamsSchema', () => {
    it('should validate UUID parameter', () => {
      const validParams = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = bookingParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });
  });
});

