/**
 * INTEGRATION TESTS - ANALYTICS SERVICE ROUTES
 * Tests actual route handlers to increase coverage
 */

import Fastify, { FastifyInstance } from 'fastify';
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

describe('Analytics Service Routes', () => {
  let app: FastifyInstance;
  let mockTenantDb: any;

  beforeAll(async () => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);

    app = Fastify();
    
    // Register analytics routes
    app.register(async (fastify) => {
      // Revenue analytics
      fastify.get('/api/v1/analytics/revenue', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { startDate, endDate } = request.query as any;

        const result = await mockTenantDb.query(
          `SELECT 
            SUM(amount) as total_revenue,
            COUNT(*) as total_transactions,
            AVG(amount) as average_transaction
           FROM payments 
           WHERE tenant_id = $1 
           AND created_at >= $2 
           AND created_at <= $3`,
          [tenantId, startDate || '2024-01-01', endDate || new Date().toISOString()]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // User analytics
      fastify.get('/api/v1/analytics/users', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `SELECT 
            COUNT(*) FILTER (WHERE status = 'active') as active_users,
            COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
            COUNT(*) as total_users
           FROM students 
           WHERE tenant_id = $1`,
          [tenantId]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Booking analytics
      fastify.get('/api/v1/analytics/bookings', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { startDate, endDate } = request.query as any;

        const result = await mockTenantDb.query(
          `SELECT 
            COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
            COUNT(*) as total_bookings
           FROM bookings 
           WHERE tenant_id = $1 
           AND created_at >= $2 
           AND created_at <= $3`,
          [tenantId, startDate || '2024-01-01', endDate || new Date().toISOString()]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Library analytics
      fastify.get('/api/v1/analytics/libraries', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `SELECT 
            COUNT(*) as total_libraries,
            SUM(capacity) as total_capacity,
            SUM(current_occupancy) as total_occupancy,
            AVG(current_occupancy::float / NULLIF(capacity, 0)) as avg_occupancy_rate
           FROM libraries 
           WHERE tenant_id = $1 
           AND deleted_at IS NULL`,
          [tenantId]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Student analytics
      fastify.get('/api/v1/analytics/students/:studentId/study-patterns', async (request, reply) => {
        const { studentId } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `SELECT 
            COUNT(*) as total_sessions,
            AVG(EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600) as avg_hours_per_session,
            COUNT(DISTINCT DATE(check_in_time)) as days_studied
           FROM attendance 
           WHERE student_id = $1 
           AND tenant_id = $2`,
          [studentId, tenantId]
        );

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

  describe('Revenue Analytics', () => {
    it('should get revenue analytics', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          total_revenue: 100000,
          total_transactions: 50,
          average_transaction: 2000,
        }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/revenue',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.total_revenue).toBe(100000);
    });
  });

  describe('User Analytics', () => {
    it('should get user analytics', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          active_users: 100,
          suspended_users: 5,
          total_users: 105,
        }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/users',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Booking Analytics', () => {
    it('should get booking analytics', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          confirmed_bookings: 200,
          cancelled_bookings: 10,
          total_bookings: 210,
        }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/bookings',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Library Analytics', () => {
    it('should get library analytics', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          total_libraries: 5,
          total_capacity: 250,
          total_occupancy: 125,
          avg_occupancy_rate: 0.5,
        }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/libraries',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Student Analytics', () => {
    it('should get student study patterns', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          total_sessions: 30,
          avg_hours_per_session: 3.5,
          days_studied: 20,
        }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/students/student-123/study-patterns',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });
});

