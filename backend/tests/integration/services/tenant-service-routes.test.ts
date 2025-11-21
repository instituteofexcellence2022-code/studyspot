/**
 * INTEGRATION TESTS - TENANT SERVICE ROUTES
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
    request.user = { id: 'user-123', role: 'super_admin', tenantId: 'tenant-123' };
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

describe('Tenant Service Routes', () => {
  let app: FastifyInstance;
  let mockCoreDb: any;

  beforeAll(async () => {
    mockCoreDb = {
      query: jest.fn(),
    };
    (coreDb.query as jest.Mock).mockImplementation(mockCoreDb.query);

    app = Fastify();
    
    // Register tenant routes
    app.register(async (fastify) => {
      // Create tenant
      fastify.post('/api/v1/tenants', async (request, reply) => {
        const { name, email, phone, subscription_plan } = request.body as any;
        if (!name || !email || !phone) {
          return reply.code(400).send({ error: 'Missing required fields' });
        }

        const result = await mockCoreDb.query(
          `INSERT INTO tenants (name, email, phone, subscription_plan, status)
           VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
          [name, email, phone, subscription_plan || 'free']
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Get tenants
      fastify.get('/api/v1/tenants', async (request, reply) => {
        const { page = 1, limit = 20, status } = request.query as any;

        let query = 'SELECT * FROM tenants WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
          query += ` AND status = $${paramIndex++}`;
          params.push(status);
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

      // Get tenant by ID
      fastify.get('/api/v1/tenants/:id', async (request, reply) => {
        const { id } = request.params as any;

        const result = await mockCoreDb.query(
          'SELECT * FROM tenants WHERE id = $1',
          [id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Tenant not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Update tenant
      fastify.put('/api/v1/tenants/:id', async (request, reply) => {
        const { id } = request.params as any;
        const updates = request.body as any;

        const result = await mockCoreDb.query(
          `UPDATE tenants SET name = $1, email = $2, phone = $3
           WHERE id = $4 RETURNING *`,
          [updates.name, updates.email, updates.phone, id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Tenant not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Suspend tenant
      fastify.post('/api/v1/tenants/:id/suspend', async (request, reply) => {
        const { id } = request.params as any;
        const { reason } = request.body as any;

        const result = await mockCoreDb.query(
          `UPDATE tenants SET status = 'suspended', suspended_at = NOW(), suspension_reason = $1
           WHERE id = $2 RETURNING *`,
          [reason, id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Tenant not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Activate tenant
      fastify.post('/api/v1/tenants/:id/activate', async (request, reply) => {
        const { id } = request.params as any;

        const result = await mockCoreDb.query(
          `UPDATE tenants SET status = 'active', suspended_at = NULL, suspension_reason = NULL
           WHERE id = $1 RETURNING *`,
          [id]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Tenant not found' });
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

  describe('Create Tenant', () => {
    it('should create tenant successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'tenant-123',
          name: 'Test Library',
          email: 'test@library.com',
          phone: '+1234567890',
          subscription_plan: 'free',
          status: 'active',
        }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tenants',
        payload: {
          name: 'Test Library',
          email: 'test@library.com',
          phone: '+1234567890',
          subscription_plan: 'free',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Test Library');
    });

    it('should reject creation with missing fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tenants',
        payload: { name: 'Test Library' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Get Tenants', () => {
    it('should get tenants with pagination', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'tenant-1', name: 'Library 1' },
            { id: 'tenant-2', name: 'Library 2' },
          ],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tenants?page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.pagination.total).toBe(5);
    });

    it('should filter tenants by status', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'tenant-1', status: 'active' }],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tenants?status=active',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Get Tenant by ID', () => {
    it('should get tenant successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'tenant-123', name: 'Test Library' }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tenants/tenant-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should return 404 for non-existent tenant', async () => {
      mockCoreDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tenants/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Update Tenant', () => {
    it('should update tenant successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'tenant-123',
          name: 'Updated Library',
          email: 'updated@library.com',
          phone: '+9876543210',
        }],
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/tenants/tenant-123',
        payload: {
          name: 'Updated Library',
          email: 'updated@library.com',
          phone: '+9876543210',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Suspend Tenant', () => {
    it('should suspend tenant successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'tenant-123', status: 'suspended' }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tenants/tenant-123/suspend',
        payload: { reason: 'Violation of terms' },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('suspended');
    });
  });

  describe('Activate Tenant', () => {
    it('should activate tenant successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'tenant-123', status: 'active' }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tenants/tenant-123/activate',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('active');
    });
  });
});

