/**
 * INTEGRATION TESTS - STUDENT SERVICE ROUTES
 * Tests for student service HTTP endpoints
 */

import Fastify from 'fastify';
import { generateTestToken } from '../../helpers/testAuth';
import { createTestTenant, createTestStudent, cleanCoreDatabase, cleanTenantDatabase, closeTestDb } from '../../helpers/testDb';

// Import student service setup
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { authenticate, AuthenticatedRequest } from '../../../src/middleware/auth';
import { requestLogger } from '../../../src/middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../../src/middleware/errorHandler';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../../src/middleware/rateLimiter';
import {
  createStudentSchema,
  updateStudentSchema,
  getStudentsQuerySchema,
  getStudentParamsSchema,
} from '../../../src/validators/student.validator';
import { validateBody, validateQuery, validateParams } from '../../../src/middleware/validator';

async function createStudentServiceApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: ['http://localhost:3002'], credentials: true });
  await app.register(helmet);
  await registerRateLimit(app, SERVICE_RATE_LIMITS.student);
  app.addHook('onRequest', requestLogger);

  app.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
    if (request.url === '/health') return;
    return authenticate(request, reply);
  });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.get('/health', async () => ({
    success: true,
    data: { status: 'healthy', service: 'student-service', timestamp: new Date().toISOString() },
  }));

  app.post('/api/v1/students', {
    preHandler: [validateBody(createStudentSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const body = request.body as any;

    const result = await tenantDb.query(
      `INSERT INTO users (tenant_id, first_name, last_name, email, phone, user_type)
       VALUES ($1, $2, $3, $4, $5, 'student')
       RETURNING id, first_name, last_name, email, phone`,
      [tenantId, body.first_name, body.last_name || null, body.email || null, body.phone]
    );

    return reply.status(201).send({ success: true, data: result.rows[0] });
  });

  app.get('/api/v1/students', {
    preHandler: [validateQuery(getStudentsQuerySchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      `SELECT id, first_name, last_name, email, phone, user_type, created_at
       FROM users WHERE tenant_id = $1 AND user_type = 'student' AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return reply.send({ success: true, data: result.rows });
  });

  app.get('/api/v1/students/:id', {
    preHandler: [validateParams(getStudentParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };

    const result = await tenantDb.query(
      `SELECT id, first_name, last_name, email, phone, user_type, created_at
       FROM users WHERE id = $1 AND tenant_id = $2 AND user_type = 'student'`,
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }

    return reply.send({ success: true, data: result.rows[0] });
  });

  app.put('/api/v1/students/:id', {
    preHandler: [validateParams(getStudentParamsSchema), validateBody(updateStudentSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(body.first_name);
    }
    if (body.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(body.last_name);
    }
    if (body.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(body.email);
    }

    if (updates.length === 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No fields to update' },
      });
    }

    values.push(id, tenantId);
    const result = await tenantDb.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }

    return reply.send({ success: true, data: result.rows[0] });
  });

  return app;
}

describe('Student Service Routes', () => {
  let app: any;
  let authToken: string;
  let tenant: any;

  beforeAll(async () => {
    await cleanCoreDatabase();
    tenant = await createTestTenant();

    authToken = await generateTestToken({
      id: 'user-123',
      email: 'admin@example.com',
      tenantId: tenant.id,
      role: 'admin',
    });

    app = await createStudentServiceApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (tenant) await cleanTenantDatabase(tenant.id);
    await cleanCoreDatabase();
    await closeTestDb();
  });

  describe('GET /health', () => {
    it('should return health check', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.service).toBe('student-service');
    });
  });

  describe('POST /api/v1/students', () => {
    it('should create a student', async () => {
      const studentData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: studentData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.first_name).toBe(studentData.first_name);
    });

    it('should return 400 for invalid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: { first_name: '', phone: '123' }, // Invalid
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/students', () => {
    it('should retrieve students list', async () => {
      await createTestStudent(tenant.id);
      await createTestStudent(tenant.id);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/students',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('should retrieve student by ID', async () => {
      const student = await createTestStudent(tenant.id);

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/students/${student.id}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(student.id);
    });
  });

  describe('PUT /api/v1/students/:id', () => {
    it('should update student', async () => {
      const student = await createTestStudent(tenant.id);

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/students/${student.id}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: {
          first_name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.first_name).toBe('Updated Name');
    });
  });
});

