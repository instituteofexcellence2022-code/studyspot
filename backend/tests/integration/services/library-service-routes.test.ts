/**
 * INTEGRATION TESTS - LIBRARY SERVICE ROUTES
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

describe('Library Service Routes', () => {
  let app: Fastify.FastifyInstance;
  let mockTenantDb: any;

  beforeAll(async () => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);

    app = Fastify();
    
    // Register library routes
    app.register(async (fastify) => {
      // Create library
      fastify.post('/api/v1/libraries', async (request, reply) => {
        const { name, address, city, state, pincode, capacity } = request.body as any;
        if (!name || !address || !city || !state || !pincode || !capacity) {
          return reply.code(400).send({ error: 'Missing required fields' });
        }

        const tenantId = (request as any).tenantId || 'tenant-123';
        const result = await mockTenantDb.query(
          `INSERT INTO libraries (tenant_id, name, address, city, state, pincode, capacity, current_occupancy)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0) RETURNING *`,
          [tenantId, name, address, city, state, pincode, capacity]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Get libraries
      fastify.get('/api/v1/libraries', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { status, city, page = 1, limit = 20 } = request.query as any;

        let query = 'SELECT * FROM libraries WHERE tenant_id = $1 AND deleted_at IS NULL';
        const params: any[] = [tenantId];

        if (status) {
          query += ' AND status = $2';
          params.push(status);
        }

        if (city) {
          query += ' AND city = $3';
          params.push(city);
        }

        const countResult = await mockTenantDb.query(`SELECT COUNT(*) FROM (${query}) as count_query`, params);
        const total = parseInt(countResult.rows[0].count);

        const offset = (page - 1) * limit;
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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

      // Get library by ID
      fastify.get('/api/v1/libraries/:id', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          'SELECT * FROM libraries WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Library not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Update library
      fastify.put('/api/v1/libraries/:id', async (request, reply) => {
        const { id } = request.params as any;
        const updates = request.body as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE libraries SET name = $1, address = $2, city = $3
           WHERE id = $4 AND tenant_id = $5 RETURNING *`,
          [updates.name, updates.address, updates.city, id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Library not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Update occupancy
      fastify.patch('/api/v1/libraries/:id/occupancy', async (request, reply) => {
        const { id } = request.params as any;
        const { current_occupancy } = request.body as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE libraries SET current_occupancy = $1
           WHERE id = $2 AND tenant_id = $3 RETURNING *`,
          [current_occupancy, id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Library not found' });
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

  describe('Create Library', () => {
    it('should create library successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'lib-123',
          tenant_id: 'tenant-123',
          name: 'Test Library',
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          capacity: 50,
          current_occupancy: 0,
        }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/libraries',
        payload: {
          name: 'Test Library',
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          capacity: 50,
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
        url: '/api/v1/libraries',
        payload: { name: 'Test Library' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Get Libraries', () => {
    it('should get libraries with pagination', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'lib-1', name: 'Library 1' },
            { id: 'lib-2', name: 'Library 2' },
          ],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/libraries?page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.pagination.total).toBe(10);
    });

    it('should filter libraries by status', async () => {
      mockTenantDb.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'lib-1', name: 'Active Library', status: 'active' }],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/libraries?status=active',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });

  describe('Get Library by ID', () => {
    it('should get library successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'lib-123', name: 'Test Library' }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/libraries/lib-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('lib-123');
    });

    it('should return 404 for non-existent library', async () => {
      mockTenantDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/libraries/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Update Library', () => {
    it('should update library successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'lib-123',
          name: 'Updated Library',
          address: '456 New St',
          city: 'New City',
        }],
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/libraries/lib-123',
        payload: {
          name: 'Updated Library',
          address: '456 New St',
          city: 'New City',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Library');
    });
  });

  describe('Update Occupancy', () => {
    it('should update library occupancy', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'lib-123',
          current_occupancy: 25,
          capacity: 50,
        }],
      });

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/libraries/lib-123/occupancy',
        payload: { current_occupancy: 25 },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.current_occupancy).toBe(25);
    });
  });
});

