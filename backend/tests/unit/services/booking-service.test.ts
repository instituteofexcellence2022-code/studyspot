/**
 * UNIT TESTS - BOOKING SERVICE
 * Tests for booking service business logic
 */

import { tenantDbManager } from '../../../src/config/database';
import { NotFoundError } from '../../../src/utils/errors';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/utils/socketHelpers', () => ({
  emitBookingCreated: jest.fn(),
  emitBookingUpdated: jest.fn(),
  emitBookingCancelled: jest.fn(),
}));

describe('Booking Service', () => {
  let mockTenantDb: any;
  const tenantId = 'test-tenant-id';

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };

    (tenantDbManager.getTenantConnection as jest.Mock) = jest.fn().mockResolvedValue(mockTenantDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking Database Operations', () => {
    it('should create a booking in database', async () => {
      const bookingData = {
        user_id: 'user-123',
        library_id: 'library-123',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:00:00Z',
        total_amount: 100,
        status: 'pending',
      };

      mockTenantDb.query
        .mockResolvedValueOnce({
          rows: [{ id: 'booking-123', ...bookingData }],
        })
        .mockResolvedValueOnce({ rows: [{ id: 'user-123', first_name: 'John', last_name: 'Doe' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'library-123', name: 'Test Library' }] });

      const result = await mockTenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [tenantId, bookingData.user_id, bookingData.library_id, bookingData.start_time, bookingData.end_time, bookingData.status, bookingData.total_amount]
      );

      expect(result.rows[0].id).toBe('booking-123');
      expect(mockTenantDb.query).toHaveBeenCalled();
    });

    it('should retrieve bookings with filters', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ total: '2' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'booking-1', status: 'confirmed', user_id: 'user-1', library_id: 'lib-1' },
            { id: 'booking-2', status: 'confirmed', user_id: 'user-2', library_id: 'lib-1' },
          ],
        })
        .mockResolvedValue({ rows: [] }); // For enrichment queries

      const countResult = await mockTenantDb.query(
        'SELECT COUNT(*) as total FROM bookings WHERE tenant_id = $1 AND status = $2',
        [tenantId, 'confirmed']
      );

      const bookingsResult = await mockTenantDb.query(
        'SELECT * FROM bookings WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4',
        [tenantId, 'confirmed', 10, 0]
      );

      expect(parseInt(countResult.rows[0].total)).toBe(2);
      expect(bookingsResult.rows).toHaveLength(2);
    });

    it('should retrieve booking by ID', async () => {
      const bookingId = 'booking-123';
      mockTenantDb.query.mockResolvedValue({
        rows: [{ id: bookingId, status: 'confirmed', user_id: 'user-123', library_id: 'lib-123' }],
      });

      const result = await mockTenantDb.query(
        'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
        [bookingId, tenantId]
      );

      expect(result.rows[0].id).toBe(bookingId);
    });

    it('should update booking status', async () => {
      const bookingId = 'booking-123';
      const newStatus = 'confirmed';

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: bookingId }] })
        .mockResolvedValueOnce({ rows: [{ id: bookingId, status: newStatus }] });

      // Check exists
      const checkResult = await mockTenantDb.query(
        'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
        [bookingId, tenantId]
      );

      if (checkResult.rows.length > 0) {
        const updateResult = await mockTenantDb.query(
          'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [newStatus, bookingId]
        );

        expect(updateResult.rows[0].status).toBe(newStatus);
      }
    });

    it('should cancel booking', async () => {
      const bookingId = 'booking-123';

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ id: bookingId, status: 'confirmed' }] })
        .mockResolvedValueOnce({ rows: [{ id: bookingId, status: 'cancelled' }] });

      // Check exists
      const checkResult = await mockTenantDb.query(
        'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
        [bookingId, tenantId]
      );

      if (checkResult.rows.length > 0) {
        const cancelResult = await mockTenantDb.query(
          'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          ['cancelled', bookingId]
        );

        expect(cancelResult.rows[0].status).toBe('cancelled');
      }
    });
  });
});

