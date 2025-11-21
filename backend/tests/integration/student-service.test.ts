/**
 * INTEGRATION TESTS - STUDENT SERVICE
 * Tests for student service business logic
 */

import { createTestTenant, createTestStudent, cleanCoreDatabase, cleanTenantDatabase, closeTestDb } from '../helpers/testDb';
import { tenantDbManager } from '../../src/config/database';
import { HTTP_STATUS, ERROR_CODES } from '../../src/config/constants';

describe('Student Service Integration Tests', () => {
  let tenant: any;

  beforeAll(async () => {
    // Clean databases
    await cleanCoreDatabase();
    
    // Create test tenant
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

  describe('Student CRUD Operations', () => {
    it('should create a student', async () => {
      const student = await createTestStudent(tenant.id, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
      });

      expect(student).toBeDefined();
      expect(student.first_name).toBe('John');
      expect(student.email).toBe('john@test.com');
      expect(student.tenant_id).toBe(tenant.id);
    });

    it('should retrieve students from tenant database', async () => {
      await createTestStudent(tenant.id, { first_name: 'Student 1' });
      await createTestStudent(tenant.id, { first_name: 'Student 2' });

      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      const result = await tenantDb.query(
        'SELECT * FROM students WHERE tenant_id = $1 AND deleted_at IS NULL',
        [tenant.id]
      );

      expect(result.rows).toHaveLength(2);
    });

    it('should update student information', async () => {
      const student = await createTestStudent(tenant.id);
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      await tenantDb.query(
        'UPDATE students SET first_name = $1 WHERE id = $2',
        ['Updated Name', student.id]
      );

      const updated = await tenantDb.query(
        'SELECT * FROM students WHERE id = $1',
        [student.id]
      );

      expect(updated.rows[0].first_name).toBe('Updated Name');
    });

    it('should soft delete a student', async () => {
      const student = await createTestStudent(tenant.id);
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      await tenantDb.query(
        'UPDATE students SET deleted_at = NOW() WHERE id = $1',
        [student.id]
      );

      const deleted = await tenantDb.query(
        'SELECT * FROM students WHERE id = $1 AND deleted_at IS NULL',
        [student.id]
      );

      expect(deleted.rows).toHaveLength(0);
    });
  });

  describe('Student Profile Features', () => {
    it('should create academic goals table and insert goal', async () => {
      const student = await createTestStudent(tenant.id);
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create table
      await tenantDb.query(`
        CREATE TABLE IF NOT EXISTS student_academic_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id UUID NOT NULL,
          tenant_id UUID NOT NULL,
          goal TEXT NOT NULL,
          target_date DATE,
          priority VARCHAR(20) DEFAULT 'medium',
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Insert goal
      const result = await tenantDb.query(
        `INSERT INTO student_academic_goals (student_id, tenant_id, goal, priority)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [student.id, tenant.id, 'Complete course', 'high']
      );

      expect(result.rows[0].goal).toBe('Complete course');
      expect(result.rows[0].priority).toBe('high');
    });

    it('should create privacy settings table and insert settings', async () => {
      const student = await createTestStudent(tenant.id);
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create table
      await tenantDb.query(`
        CREATE TABLE IF NOT EXISTS student_privacy_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id UUID NOT NULL UNIQUE,
          tenant_id UUID NOT NULL,
          profile_visibility VARCHAR(20) DEFAULT 'public',
          show_email BOOLEAN DEFAULT true,
          show_phone BOOLEAN DEFAULT true,
          show_location BOOLEAN DEFAULT true,
          allow_data_sharing BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Insert settings
      const result = await tenantDb.query(
        `INSERT INTO student_privacy_settings (student_id, tenant_id, profile_visibility, show_email)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [student.id, tenant.id, 'private', false]
      );

      expect(result.rows[0].profile_visibility).toBe('private');
      expect(result.rows[0].show_email).toBe(false);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should isolate student data between tenants', async () => {
      const tenant1 = await createTestTenant({ name: 'Tenant 1' });
      const tenant2 = await createTestTenant({ name: 'Tenant 2' });

      await createTestStudent(tenant1.id, { first_name: 'Tenant1 Student' });
      await createTestStudent(tenant2.id, { first_name: 'Tenant2 Student' });

      const tenant1Db = await tenantDbManager.getTenantConnection(tenant1.id);
      const tenant2Db = await tenantDbManager.getTenantConnection(tenant2.id);

      const tenant1Students = await tenant1Db.query(
        'SELECT * FROM students WHERE tenant_id = $1',
        [tenant1.id]
      );

      const tenant2Students = await tenant2Db.query(
        'SELECT * FROM students WHERE tenant_id = $1',
        [tenant2.id]
      );

      expect(tenant1Students.rows).toHaveLength(1);
      expect(tenant2Students.rows).toHaveLength(1);
      expect(tenant1Students.rows[0].first_name).toBe('Tenant1 Student');
      expect(tenant2Students.rows[0].first_name).toBe('Tenant2 Student');
    });
  });
});

