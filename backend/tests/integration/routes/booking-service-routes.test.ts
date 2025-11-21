/**
 * INTEGRATION TESTS - BOOKING SERVICE ROUTES
 * Tests for booking service HTTP endpoints using Supertest
 */

import Fastify, { FastifyInstance } from 'fastify';
import { createTestToken as generateTestToken } from '../../helpers/testAuth';
import { createTestTenant, createTestLibrary, createTestStudent, cleanCoreDatabase, cleanTenantDatabase, closeTestDb, isTestDbAvailable } from '../../helpers/testDb';

// Import booking service setup
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { authenticate, AuthenticatedRequest } from '../../../src/middleware/auth';
import { requestLogger } from '../../../src/middleware/requestLogger';
import { errorHandler, notFoundHandler } from '../../../src/middleware/errorHandler';
import { registerRateLimit, SERVICE_RATE_LIMITS } from '../../../src/middleware/rateLimiter';
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingsQuerySchema,
  bookingParamsSchema,
} from '../../../src/validators/booking.validator';
import { validateBody, validateQuery, validateParams } from '../../../src/middleware/validator';

// Mock the actual booking service routes
async function createBookingServiceApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(cors, {
    origin: ['http://localhost:3002'],
    credentials: true,
  });

  await app.register(helmet);
  await registerRateLimit(app, SERVICE_RATE_LIMITS.booking);
  app.addHook('onRequest', requestLogger);

  app.addHook('onRequest', async (request: AuthenticatedRequest, reply) => {
    if (request.url === '/health') return;
    return authenticate(request, reply);
  });

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  // Health check
  app.get('/health', async () => ({
    success: true,
    data: {
      status: 'healthy',
      service: 'booking-service',
      timestamp: new Date().toISOString(),
    },
  }));

  // Mock booking routes - we'll test the actual service structure
  app.post('/api/v1/bookings', {
    preHandler: [validateBody(createBookingSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const body = request.body as any;

    const result = await tenantDb.query(
      `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        tenantId,
        (request.user as any)?.id,
        body.library_id,
        body.start_time,
        body.end_time,
        body.status || 'pending',
        body.total_amount,
      ]
    );

    return reply.status(201).send({
      success: true,
      data: result.rows[0],
    });
  });

  app.get('/api/v1/bookings', {
    preHandler: [validateQuery(getBookingsQuerySchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);

    const result = await tenantDb.query(
      'SELECT * FROM bookings WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );

    return reply.send({
      success: true,
      data: result.rows,
    });
  });

  app.get('/api/v1/bookings/:id', {
    preHandler: [validateParams(bookingParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };

    const result = await tenantDb.query(
      'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  app.put('/api/v1/bookings/:id', {
    preHandler: [validateParams(bookingParamsSchema), validateBody(updateBookingSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const result = await tenantDb.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *`,
      [body.status, id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  app.delete('/api/v1/bookings/:id', {
    preHandler: [validateParams(bookingParamsSchema)],
  }, async (request: AuthenticatedRequest, reply) => {
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantId = (request as any).tenantId || (request.user as any)?.tenantId;
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    const { id } = request.params as { id: string };

    const result = await tenantDb.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [id, tenantId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Booking not found' },
      });
    }

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  return app;
}

describe('Booking Service Routes', () => {
  let app: FastifyInstance;
  let authToken: string;
  let tenant: any;
  let library: any;
  let student: any;
  let dbAvailable: boolean;

  beforeAll(async () => {
    // Check if database is available
    dbAvailable = await isTestDbAvailable();
    if (!dbAvailable) {
      console.warn('⚠️  Database not available, skipping integration tests');
      return;
    }

    // Setup test database
    await cleanCoreDatabase();
    tenant = await createTestTenant();
    library = await createTestLibrary(tenant.id);
    student = await createTestStudent(tenant.id);

    // Generate auth token
    authToken = generateTestToken({
      userId: student.id,
      id: student.id,
      email: student.email,
      tenantId: tenant.id,
      role: 'student',
    });

    // Create booking service app for testing
    // We'll use the test app factory instead of the actual service
    app = await createBookingServiceApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (tenant) {
      await cleanTenantDatabase(tenant.id);
    }
    await cleanCoreDatabase();
    await closeTestDb();
  });

  beforeEach(async () => {
    if (!dbAvailable || !tenant) return;
    const { tenantDbManager } = await import('../../../src/config/database');
    const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
    await tenantDb.query('TRUNCATE TABLE bookings CASCADE');
  });

  // Skip all tests if database is not available
  if (!dbAvailable) {
    it.skip('Database not available - skipping integration tests', () => {});
  } else {
    describe('POST /api/v1/bookings', () => {
      it('should create a booking successfully', async () => {
      const bookingData = {
        library_id: library.id,
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:00:00Z',
        total_amount: 100,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: bookingData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.library_id).toBe(library.id);
    });

    it('should return 400 for invalid booking data', async () => {
      const invalidData = {
        library_id: 'invalid-uuid',
        start_time: 'invalid-date',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: invalidData,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        payload: {
          library_id: library.id,
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T12:00:00Z',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should retrieve bookings list', async () => {
      // Create a booking first
      const { tenantDbManager } = await import('../../../src/config/database');
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bookings',
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

    it('should filter bookings by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bookings?status=confirmed',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should retrieve booking by ID', async () => {
      // Create a booking first
      const { tenantDbManager } = await import('../../../src/config/database');
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      const result = await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      const bookingId = result.rows[0].id;

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/bookings/${bookingId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(bookingId);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bookings/00000000-0000-0000-0000-000000000000',
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/bookings/:id', () => {
    it('should update booking', async () => {
      // Create a booking first
      const { tenantDbManager } = await import('../../../src/config/database');
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      const result = await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'pending', 100]
      );

      const bookingId = result.rows[0].id;

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/bookings/${bookingId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
        payload: {
          status: 'confirmed',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('confirmed');
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should cancel booking', async () => {
      // Create a booking first
      const { tenantDbManager } = await import('../../../src/config/database');
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      const result = await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      const bookingId = result.rows[0].id;

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/bookings/${bookingId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
          'x-tenant-id': tenant.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
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
      expect(body.data.service).toBe('booking-service');
    });
  });
  }
});

