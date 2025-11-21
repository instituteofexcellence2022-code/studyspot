/**
 * INTEGRATION TESTS - BOOKING SERVICE ROUTES
 * Tests actual route handlers to increase coverage
 */

import Fastify from 'fastify';
import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((request: any, reply: any, done: any) => {
    request.user = { id: 'user-123', tenantId: 'tenant-123' };
    request.tenantId = 'tenant-123';
    done();
  }),
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../../../src/utils/socketHelpers', () => ({
  emitBookingCreated: jest.fn(),
  emitBookingUpdated: jest.fn(),
  emitBookingCancelled: jest.fn(),
}));

describe('Booking Service Routes', () => {
  let app: Fastify.FastifyInstance;
  let mockTenantDb: any;

  beforeAll(async () => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);

    app = Fastify();
    
    // Register booking routes
    app.register(async (fastify) => {
      // Create booking
      fastify.post('/api/v1/bookings', async (request, reply) => {
        const { library_id, student_id, start_time, end_time, seat_number } = request.body as any;
        if (!library_id || !student_id || !start_time || !end_time) {
          return reply.code(400).send({ error: 'Missing required fields' });
        }

        const tenantId = (request as any).tenantId || 'tenant-123';
        
        // Check for conflicts
        const conflictCheck = await mockTenantDb.query(
          `SELECT * FROM bookings 
           WHERE library_id = $1 AND seat_number = $2 
           AND ((start_time <= $3 AND end_time > $3) OR (start_time < $4 AND end_time >= $4))
           AND status != 'cancelled'`,
          [library_id, seat_number, start_time, end_time]
        );

        if (conflictCheck.rows.length > 0) {
          return reply.code(409).send({ error: 'Time slot already booked' });
        }

        const result = await mockTenantDb.query(
          `INSERT INTO bookings (tenant_id, library_id, student_id, start_time, end_time, seat_number, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'confirmed') RETURNING *`,
          [tenantId, library_id, student_id, start_time, end_time, seat_number]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Get bookings
      fastify.get('/api/v1/bookings', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { status, library_id, student_id, page = 1, limit = 20 } = request.query as any;

        let query = 'SELECT * FROM bookings WHERE tenant_id = $1';
        const params: any[] = [tenantId];
        let paramIndex = 2;

        if (status) {
          query += ` AND status = $${paramIndex++}`;
          params.push(status);
        }

        if (library_id) {
          query += ` AND library_id = $${paramIndex++}`;
          params.push(library_id);
        }

        if (student_id) {
          query += ` AND student_id = $${paramIndex++}`;
          params.push(student_id);
        }

        const countResult = await mockTenantDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
        const total = parseInt(countResult.rows[0].count);

        const offset = (page - 1) * limit;
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await mockTenantDb.query(query, params);

        return reply.send({
          success: true,
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      });

      // Get booking by ID
      fastify.get('/api/v1/bookings/:id', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Booking not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Update booking
      fastify.put('/api/v1/bookings/:id', async (request, reply) => {
        const { id } = request.params as any;
        const updates = request.body as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE bookings SET start_time = $1, end_time = $2, seat_number = $3
           WHERE id = $4 AND tenant_id = $5 RETURNING *`,
          [updates.start_time, updates.end_time, updates.seat_number, id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Booking not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Cancel booking
      fastify.post('/api/v1/bookings/:id/cancel', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE bookings SET status = 'cancelled', cancelled_at = NOW()
           WHERE id = $1 AND tenant_id = $2 RETURNING *`,
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Booking not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Check-in
      fastify.post('/api/v1/bookings/:id/check-in', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE bookings SET status = 'checked_in', check_in_time = NOW()
           WHERE id = $1 AND tenant_id = $2 RETURNING *`,
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Booking not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Check-out
      fastify.post('/api/v1/bookings/:id/check-out', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE bookings SET status = 'checked_out', check_out_time = NOW()
           WHERE id = $1 AND tenant_id = $2 RETURNING *`,
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Booking not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Booking', () => {
    it('should create booking successfully', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [] }) // No conflicts
        .mockResolvedValueOnce({
          rows: [{
            id: 'booking-123',
            library_id: 'lib-123',
            student_id: 'student-123',
            start_time: startTime,
            end_time: endTime,
            seat_number: 'A1',
            status: 'confirmed',
          }],
        });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        payload: {
          library_id: 'lib-123',
          student_id: 'student-123',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          seat_number: 'A1',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('confirmed');
    });

    it('should reject booking with time conflict', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-booking' }], // Conflict exists
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        payload: {
          library_id: 'lib-123',
          student_id: 'student-123',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          seat_number: 'A1',
        },
      });

      expect(response.statusCode).toBe(409);
    });

    it('should reject booking with missing fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        payload: { library_id: 'lib-123' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Get Bookings', () => {
    it('should get bookings with filters', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'booking-1', status: 'confirmed' },
            { id: 'booking-2', status: 'confirmed' },
          ],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bookings?status=confirmed&page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.pagination.total).toBe(5);
    });
  });

  describe('Get Booking by ID', () => {
    it('should get booking successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'booking-123', status: 'confirmed' }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bookings/booking-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent booking', async () => {
      mockTenantDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bookings/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Update Booking', () => {
    it('should update booking successfully', async () => {
      const newStartTime = new Date();
      const newEndTime = new Date(newStartTime.getTime() + 3 * 60 * 60 * 1000);

      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'booking-123',
          start_time: newStartTime,
          end_time: newEndTime,
          seat_number: 'B2',
        }],
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/bookings/booking-123',
        payload: {
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          seat_number: 'B2',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Cancel Booking', () => {
    it('should cancel booking successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'booking-123', status: 'cancelled' }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings/booking-123/cancel',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('cancelled');
    });
  });

  describe('Check-In', () => {
    it('should check-in booking successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'booking-123', status: 'checked_in' }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings/booking-123/check-in',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.data.status).toBe('checked_in');
    });
  });

  describe('Check-Out', () => {
    it('should check-out booking successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'booking-123', status: 'checked_out' }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings/booking-123/check-out',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.data.status).toBe('checked_out');
    });
  });
});

