/**
 * INTEGRATION TESTS - BOOKING SERVICE
 * Tests for booking service endpoints
 */

import { createTestTenant, createTestLibrary, createTestStudent, cleanCoreDatabase, cleanTenantDatabase, closeTestDb } from '../helpers/testDb';
import { tenantDbManager } from '../../src/config/database';

describe('Booking Service Integration Tests', () => {
  let tenant: any;
  let library: any;
  let student: any;

  beforeAll(async () => {
    await cleanCoreDatabase();
    tenant = await createTestTenant();
    library = await createTestLibrary(tenant.id);
    student = await createTestStudent(tenant.id);
  });

  afterAll(async () => {
    if (tenant) {
      await cleanTenantDatabase(tenant.id);
    }
    await cleanCoreDatabase();
    await closeTestDb();
  });

  beforeEach(async () => {
    if (tenant) {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      await tenantDb.query('TRUNCATE TABLE bookings CASCADE');
    }
  });

  describe('Booking CRUD Operations', () => {
    it('should create a booking', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      const bookingData = {
        tenant_id: tenant.id,
        user_id: student.id,
        library_id: library.id,
        start_time: new Date('2024-01-15T10:00:00Z'),
        end_time: new Date('2024-01-15T12:00:00Z'),
        status: 'pending',
        total_amount: 100,
        payment_status: 'pending',
      };

      const result = await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          bookingData.tenant_id,
          bookingData.user_id,
          bookingData.library_id,
          bookingData.start_time,
          bookingData.end_time,
          bookingData.status,
          bookingData.total_amount,
          bookingData.payment_status,
        ]
      );

      expect(result.rows[0]).toBeDefined();
      expect(result.rows[0].user_id).toBe(student.id);
      expect(result.rows[0].library_id).toBe(library.id);
    });

    it('should retrieve bookings for a user', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create a booking first
      await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      const result = await tenantDb.query(
        'SELECT * FROM bookings WHERE tenant_id = $1 AND user_id = $2',
        [tenant.id, student.id]
      );

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].user_id).toBe(student.id);
    });

    it('should update booking status', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create booking
      const createResult = await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'pending', 100]
      );

      const bookingId = createResult.rows[0].id;

      // Update status
      const updateResult = await tenantDb.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        ['confirmed', bookingId]
      );

      expect(updateResult.rows[0].status).toBe('confirmed');
    });

    it('should cancel a booking', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create booking
      const createResult = await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      const bookingId = createResult.rows[0].id;

      // Cancel booking
      const cancelResult = await tenantDb.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        ['cancelled', bookingId]
      );

      expect(cancelResult.rows[0].status).toBe('cancelled');
    });
  });

  describe('Booking Filters', () => {
    it('should filter bookings by status', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create bookings with different statuses
      await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'pending', 100]
      );

      const result = await tenantDb.query(
        'SELECT * FROM bookings WHERE tenant_id = $1 AND status = $2',
        [tenant.id, 'confirmed']
      );

      expect(result.rows.every((b: any) => b.status === 'confirmed')).toBe(true);
    });

    it('should filter bookings by library', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      const library2 = await createTestLibrary(tenant.id, { name: 'Library 2' });

      // Create bookings for different libraries
      await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tenant.id, student.id, library.id, new Date(), new Date(), 'confirmed', 100]
      );

      await tenantDb.query(
        `INSERT INTO bookings (tenant_id, user_id, library_id, start_time, end_time, status, total_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [tenant.id, student.id, library2.id, new Date(), new Date(), 'confirmed', 100]
      );

      const result = await tenantDb.query(
        'SELECT * FROM bookings WHERE tenant_id = $1 AND library_id = $2',
        [tenant.id, library.id]
      );

      expect(result.rows.every((b: any) => b.library_id === library.id)).toBe(true);
    });
  });
});

