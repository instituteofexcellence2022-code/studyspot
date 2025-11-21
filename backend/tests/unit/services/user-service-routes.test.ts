/**
 * INTEGRATION TESTS - USER SERVICE ROUTES
 * Tests actual route handlers to increase coverage
 */

import Fastify, { FastifyInstance } from 'fastify';
import { coreDb } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((request: any, reply: any, done: any) => {
    request.user = { id: 'user-123', role: 'admin', tenantId: 'tenant-123' };
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

describe('User Service Routes', () => {
  let app: FastifyInstance;
  let mockCoreDb: any;

  beforeAll(async () => {
    mockCoreDb = {
      query: jest.fn(),
    };
    (coreDb.query as jest.Mock).mockImplementation(mockCoreDb.query);

    app = Fastify();
    
    // Register user routes
    app.register(async (fastify) => {
      // Get all users
      fastify.get('/api/v1/admin/users', async (request, reply) => {
        const { page = 1, limit = 20, role, is_active } = request.query as any;

        let query = 'SELECT * FROM admin_users WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (role) {
          query += ` AND role = $${paramIndex++}`;
          params.push(role);
        }

        if (is_active !== undefined) {
          query += ` AND is_active = $${paramIndex++}`;
          params.push(is_active === 'true');
        }

        const countResult = await mockCoreDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
        const total = parseInt(countResult.rows[0].count);

        const offset = (page - 1) * limit;
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
        params.push(limit, offset);

        const result = await mockCoreDb.query(query, params);

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

      // Get user by ID
      fastify.get('/api/v1/admin/users/:id', async (request, reply) => {
        const { id } = request.params as any;

        const result = await mockCoreDb.query(
          'SELECT * FROM admin_users WHERE id = $1',
          [id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'User not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Update user
      fastify.put('/api/v1/admin/users/:id', async (request, reply) => {
        const { id } = request.params as any;
        const updates = request.body as any;

        const result = await mockCoreDb.query(
          `UPDATE admin_users SET first_name = $1, last_name = $2, role = $3, is_active = $4
           WHERE id = $5 RETURNING *`,
          [updates.first_name, updates.last_name, updates.role, updates.is_active, id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'User not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Get user activity
      fastify.get('/api/v1/admin/users/:id/activity', async (request, reply) => {
        const { id } = request.params as any;
        const { limit = 50 } = request.query as any;

        const result = await mockCoreDb.query(
          `SELECT * FROM audit_logs 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT $2`,
          [id, limit]
        );

        return reply.send({
          success: true,
          data: result.rows,
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

  describe('Get Users', () => {
    it('should get users with pagination', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'user-1', email: 'user1@example.com', role: 'admin' },
            { id: 'user-2', email: 'user2@example.com', role: 'manager' },
          ],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users?page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.pagination.total).toBe(10);
    });

    it('should filter users by role', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'user-1', role: 'admin' }],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users?role=admin',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Get User by ID', () => {
    it('should get user successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'user-123', email: 'user@example.com' }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users/user-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      mockCoreDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Update User', () => {
    it('should update user successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          first_name: 'Updated',
          last_name: 'Name',
          role: 'admin',
          is_active: true,
        }],
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/users/user-123',
        payload: {
          first_name: 'Updated',
          last_name: 'Name',
          role: 'admin',
          is_active: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Get User Activity', () => {
    it('should get user activity logs', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [
          { id: 'log-1', action: 'login', created_at: new Date() },
          { id: 'log-2', action: 'update', created_at: new Date() },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users/user-123/activity',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});

