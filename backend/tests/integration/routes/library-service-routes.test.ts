/**
 * INTEGRATION TESTS - LIBRARY SERVICE ROUTES
 * Tests for library service HTTP endpoints
 */

import Fastify from 'fastify';
import { generateTestToken } from '../../helpers/testAuth';
import { createTestTenant, createTestLibrary, cleanCoreDatabase, cleanTenantDatabase, closeTestDb } from '../../helpers/testDb';

// Import library service setup
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { authenticate, AuthenticatedRequest } from '../../../src/middleware/auth';
import { requestLogger } from '../../../src/middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../../src/middleware/errorHandler';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../../src/middleware/rateLimiter';
import {
  createLibrarySchema,
  updateLibrarySchema,
  getLibrariesQuerySchema,
  getLibraryParamsSchema,
} from '../../../src/validators/library.validator';
import { validateBody, validateQuery, validateParams } from '../../../src/middleware/validator';

async function createLibraryServiceApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: ['http://localhost:3002'], credentials: true });
  await app.register(helmet);
  await registerRateLimit(app, SERVICE_RATE_LIMITS.library);
  app.addHook('onRequest', requestLogger);

  app.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
    if (request.url === '/health') return;
    return authenticate(request, reply);
  });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.get('/health', async () => ({
    success: true,
    data: { status: 'healthy', service: 'library-service', timestamp: new Date().toISOString() },
  }));

  app.get('/api/v1/libraries', {
    preHandler: [validateQuery(getLibrariesQuerySchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM libraries WHERE tenant_id = $1 AND deleted_at IS NULL',
      [tenantId]
    );

    return reply.send({ success: true, data: result.rows });
  });

  app.post('/api/v1/libraries', {
    preHandler: [validateBody(createLibrarySchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const body = request.body as any;

    const result = await tenantDb.query(
      `INSERT INTO libraries (tenant_id, name, address, city, capacity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, body.name, body.address || null, body.city || null, body.capacity || 50]
    );

    return reply.status(201).send({ success: true, data: result.rows[0] });
  });

  app.get('/api/v1/libraries/:id', {
    preHandler: [validateParams(getLibraryParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };

    const result = await tenantDb.query(
      'SELECT * FROM libraries WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Library not found' },
      });
    }

    return reply.send({ success: true, data: result.rows[0] });
  });

  app.put('/api/v1/libraries/:id', {
    preHandler: [validateParams(getLibraryParamsSchema), validateBody(updateLibrarySchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const result = await tenantDb.query(
      `UPDATE libraries SET name = COALESCE($1, name), capacity = COALESCE($2, capacity), updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4 RETURNING *`,
      [body.name, body.capacity, id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Library not found' },
      });
    }

    return reply.send({ success: true, data: result.rows[0] });
  });

  return app;
}

describe('Library Service Routes', () => {
  let app: any;
  let authToken: string;
  let tenant: any;

  beforeAll(async () => {
    await cleanCoreDatabase();
    tenant = await createTestTenant();

    authToken = await generateTestToken({
      id: 'user-123',
      email: 'test@example.com',
      tenantId: tenant.id,
      role: 'library_owner',
    });

    app = await createLibraryServiceApp();
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
      expect(body.data.service).toBe('library-service');
    });
  });

  describe('POST /api/v1/libraries', () => {
    it('should create a library', async () => {
      const libraryData = {
        name: 'Test Library',
        address: '123 Test St',
        city: 'Test City',
        capacity: 50,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/libraries',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: libraryData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe(libraryData.name);
    });

    it('should return 400 for invalid data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/libraries',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: { name: '' }, // Invalid: empty name
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/libraries',
        payload: { name: 'Test Library' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/libraries', () => {
    it('should retrieve libraries list', async () => {
      await createTestLibrary(tenant.id, { name: 'Library 1' });
      await createTestLibrary(tenant.id, { name: 'Library 2' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/libraries',
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

  describe('GET /api/v1/libraries/:id', () => {
    it('should retrieve library by ID', async () => {
      const library = await createTestLibrary(tenant.id);

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/libraries/${library.id}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(library.id);
    });

    it('should return 404 for non-existent library', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/libraries/00000000-0000-0000-0000-000000000000',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/libraries/:id', () => {
    it('should update library', async () => {
      const library = await createTestLibrary(tenant.id);

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/libraries/${library.id}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: {
          name: 'Updated Library Name',
          capacity: 100,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Updated Library Name');
    });
  });
});

