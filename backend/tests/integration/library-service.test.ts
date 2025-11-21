/**
 * INTEGRATION TESTS - LIBRARY SERVICE
 * Tests for library service endpoints
 */

import { createTestTenant, createTestLibrary, cleanCoreDatabase, cleanTenantDatabase, closeTestDb } from '../helpers/testDb';
import { tenantDbManager } from '../../src/config/database';

describe('Library Service Integration Tests', () => {
  let tenant: any;

  beforeAll(async () => {
    await cleanCoreDatabase();
    tenant = await createTestTenant();
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
      await cleanTenantDatabase(tenant.id);
    }
  });

  describe('Library CRUD Operations', () => {
    it('should create a library', async () => {
      const library = await createTestLibrary(tenant.id, {
        name: 'Test Library',
        capacity: 50,
      });

      expect(library).toBeDefined();
      expect(library.name).toBe('Test Library');
      expect(library.capacity).toBe(50);
    });

    it('should retrieve libraries', async () => {
      await createTestLibrary(tenant.id, { name: 'Library 1' });
      await createTestLibrary(tenant.id, { name: 'Library 2' });

      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      const result = await tenantDb.query(
        'SELECT * FROM libraries WHERE tenant_id = $1 AND deleted_at IS NULL',
        [tenant.id]
      );

      expect(result.rows).toHaveLength(2);
    });

    it('should update library information', async () => {
      const library = await createTestLibrary(tenant.id);
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      await tenantDb.query(
        'UPDATE libraries SET name = $1, capacity = $2 WHERE id = $3',
        ['Updated Library', 100, library.id]
      );

      const updated = await tenantDb.query(
        'SELECT * FROM libraries WHERE id = $1',
        [library.id]
      );

      expect(updated.rows[0].name).toBe('Updated Library');
      expect(updated.rows[0].capacity).toBe(100);
    });

    it('should get real-time occupancy', async () => {
      const library = await createTestLibrary(tenant.id, { capacity: 50 });
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Update occupancy
      await tenantDb.query(
        'UPDATE libraries SET current_occupancy = $1 WHERE id = $2',
        [25, library.id]
      );

      const result = await tenantDb.query(
        'SELECT id, name, current_occupancy, capacity FROM libraries WHERE id = $1',
        [library.id]
      );

      expect(result.rows[0].current_occupancy).toBe(25);
      expect(result.rows[0].capacity).toBe(50);
    });
  });

  describe('Fee Plans', () => {
    it('should create a fee plan', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      const feePlan = {
        name: 'Basic Plan',
        amount: 1000,
        duration_days: 30,
        features: ['seat_booking', 'wifi'],
      };

      const result = await tenantDb.query(
        `INSERT INTO fee_plans (tenant_id, name, amount, duration_days, features)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [tenant.id, feePlan.name, feePlan.amount, feePlan.duration_days, JSON.stringify(feePlan.features)]
      );

      expect(result.rows[0].name).toBe(feePlan.name);
      expect(result.rows[0].amount).toBe(feePlan.amount);
    });

    it('should retrieve fee plans', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      await tenantDb.query(
        `INSERT INTO fee_plans (tenant_id, name, amount, duration_days)
         VALUES ($1, $2, $3, $4)`,
        [tenant.id, 'Plan 1', 1000, 30]
      );

      await tenantDb.query(
        `INSERT INTO fee_plans (tenant_id, name, amount, duration_days)
         VALUES ($1, $2, $3, $4)`,
        [tenant.id, 'Plan 2', 2000, 60]
      );

      const result = await tenantDb.query(
        'SELECT * FROM fee_plans WHERE tenant_id = $1',
        [tenant.id]
      );

      expect(result.rows).toHaveLength(2);
    });
  });
});

