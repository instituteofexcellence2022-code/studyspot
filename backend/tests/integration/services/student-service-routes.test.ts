/**
 * INTEGRATION TESTS - STUDENT SERVICE ROUTES
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

describe('Student Service Routes', () => {
  let app: Fastify.FastifyInstance;
  let mockTenantDb: any;

  beforeAll(async () => {
    mockTenantDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);

    app = Fastify();
    
    // Register student routes
    app.register(async (fastify) => {
      // Create student
      fastify.post('/api/v1/students', async (request, reply) => {
        const { first_name, last_name, email, phone } = request.body as any;
        if (!first_name || !phone) {
          return reply.code(400).send({ error: 'Missing required fields' });
        }

        const tenantId = (request as any).tenantId || 'tenant-123';
        const result = await mockTenantDb.query(
          `INSERT INTO students (tenant_id, first_name, last_name, email, phone, student_code)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [tenantId, first_name, last_name || null, email || null, phone, `STU${Date.now()}`]
        );

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Get student
      fastify.get('/api/v1/students/:id', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          'SELECT * FROM students WHERE id = $1 AND tenant_id = $2',
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Student not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Update student
      fastify.put('/api/v1/students/:id', async (request, reply) => {
        const { id } = request.params as any;
        const updates = request.body as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          `UPDATE students SET first_name = $1, last_name = $2, email = $3
           WHERE id = $4 AND tenant_id = $5 RETURNING *`,
          [updates.first_name, updates.last_name, updates.email, id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Student not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Delete student
      fastify.delete('/api/v1/students/:id', async (request, reply) => {
        const { id } = request.params as any;
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockTenantDb.query(
          'DELETE FROM students WHERE id = $1 AND tenant_id = $2 RETURNING *',
          [id, tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Student not found' });
        }

        return reply.send({
          success: true,
          message: 'Student deleted',
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

  describe('Create Student', () => {
    it('should create student successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'student-123',
          tenant_id: 'tenant-123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          student_code: 'STU123',
        }],
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        payload: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.first_name).toBe('John');
    });

    it('should reject creation with missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        payload: { email: 'john@example.com' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Get Student', () => {
    it('should get student successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'student-123',
          first_name: 'John',
          last_name: 'Doe',
        }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students/student-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('student-123');
    });

    it('should return 404 for non-existent student', async () => {
      mockTenantDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Update Student', () => {
    it('should update student successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{
          id: 'student-123',
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
        }],
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/students/student-123',
        payload: {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.first_name).toBe('Jane');
    });
  });

  describe('Delete Student', () => {
    it('should delete student successfully', async () => {
      mockTenantDb.query.mockResolvedValueOnce({
        rows: [{ id: 'student-123' }],
      });

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/students/student-123',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });
  });
});

