/**
 * TEST DATABASE HELPERS
 * Utilities for test database operations
 */

import { Pool, QueryResult } from 'pg';
import { coreDb, tenantDbManager } from '../../src/config/database';

let testPool: Pool | null = null;

/**
 * Check if test database is available
 */
export async function isTestDbAvailable(): Promise<boolean> {
  try {
    const db = await getTestDb();
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get test database connection
 */
export async function getTestDb(): Promise<Pool> {
  if (!testPool) {
    const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('TEST_DATABASE_URL or DATABASE_URL must be set for integration tests');
    }
    testPool = new Pool({
      connectionString,
      max: 5,
    });
  }
  return testPool;
}

/**
 * Clean core database tables
 */
export async function cleanCoreDatabase(): Promise<void> {
  try {
    const db = await getTestDb();
    
    // Truncate tables in correct order (respecting foreign keys)
    await db.query('TRUNCATE TABLE audit_logs CASCADE');
    await db.query('TRUNCATE TABLE subscriptions CASCADE');
    await db.query('TRUNCATE TABLE tenant_credit_wallets CASCADE');
    await db.query('TRUNCATE TABLE admin_users CASCADE');
    await db.query('TRUNCATE TABLE tenants CASCADE');
  } catch (error) {
    // If database is not available, skip cleaning
    console.warn('Could not clean core database:', error instanceof Error ? error.message : error);
    throw error; // Re-throw so tests can handle it
  }
}

/**
 * Clean tenant database tables
 */
export async function cleanTenantDatabase(tenantId: string): Promise<void> {
  try {
    const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
    
    // Truncate tenant tables
    await tenantDb.query('TRUNCATE TABLE payments CASCADE');
    await tenantDb.query('TRUNCATE TABLE bookings CASCADE');
    await tenantDb.query('TRUNCATE TABLE attendance CASCADE');
    await tenantDb.query('TRUNCATE TABLE libraries CASCADE');
    await tenantDb.query('TRUNCATE TABLE students CASCADE');
    await tenantDb.query('TRUNCATE TABLE student_academic_goals CASCADE');
    await tenantDb.query('TRUNCATE TABLE student_privacy_settings CASCADE');
    await tenantDb.query('TRUNCATE TABLE student_payment_preferences CASCADE');
  } catch (error) {
    // Tenant DB might not exist, that's okay
    console.warn('Could not clean tenant database:', error);
  }
}

/**
 * Create a test tenant
 */
export async function createTestTenant(overrides: any = {}): Promise<any> {
  const db = await getTestDb();
  
  const tenant = {
    name: 'Test Tenant',
    email: 'test@tenant.com',
    phone: '+1234567890',
    status: 'active',
    ...overrides,
  };
  
  const result = await db.query(
    `INSERT INTO tenants (name, email, phone, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tenant.name, tenant.email, tenant.phone, tenant.status]
  );
  
  return result.rows[0];
}

/**
 * Create a test admin user
 */
export async function createTestAdminUser(overrides: any = {}): Promise<any> {
  const db = await getTestDb();
  
  const admin = {
    email: 'admin@test.com',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', // 'password'
    first_name: 'Test',
    last_name: 'Admin',
    role: 'admin',
    department: 'engineering',
    is_active: true,
    ...overrides,
  };
  
  const result = await db.query(
    `INSERT INTO admin_users (email, password_hash, first_name, last_name, role, department, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, first_name, last_name, role, department, is_active, created_at`,
    [admin.email, admin.password_hash, admin.first_name, admin.last_name, admin.role, admin.department, admin.is_active]
  );
  
  return result.rows[0];
}

/**
 * Create a test student
 */
export async function createTestStudent(tenantId: string, overrides: any = {}): Promise<any> {
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  
  const student = {
    student_code: `STU${Date.now()}`,
    first_name: 'Test',
    last_name: 'Student',
    email: 'student@test.com',
    phone: '+1234567890',
    status: 'active',
    ...overrides,
  };
  
  const result = await tenantDb.query(
    `INSERT INTO students (tenant_id, student_code, first_name, last_name, email, phone, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tenantId, student.student_code, student.first_name, student.last_name, student.email, student.phone, student.status]
  );
  
  return result.rows[0];
}

/**
 * Create a test library
 */
export async function createTestLibrary(tenantId: string, overrides: any = {}): Promise<any> {
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  
  const library = {
    name: 'Test Library',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
    capacity: 50,
    current_occupancy: 0,
    status: 'active',
    ...overrides,
  };
  
  const result = await tenantDb.query(
    `INSERT INTO libraries (tenant_id, name, address, city, state, pincode, capacity, current_occupancy, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [tenantId, library.name, library.address, library.city, library.state, library.pincode, library.capacity, library.current_occupancy, library.status]
  );
  
  return result.rows[0];
}

/**
 * Create a test library owner (core DB)
 */
export async function createTestLibraryOwner(tenantId: string, overrides: any = {}): Promise<any> {
  const db = await getTestDb();
  
  const owner = {
    email: `owner${Date.now()}@test.com`,
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', // 'password'
    first_name: 'Test',
    last_name: 'Owner',
    phone: '+1234567890',
    is_active: true,
    ...overrides,
  };
  
  const result = await db.query(
    `INSERT INTO library_owners (tenant_id, email, password_hash, first_name, last_name, phone, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [tenantId, owner.email, owner.password_hash, owner.first_name, owner.last_name, owner.phone, owner.is_active]
  );
  
  return result.rows[0];
}

/**
 * Create a test platform admin (core DB)
 */
export async function createTestPlatformAdmin(overrides: any = {}): Promise<any> {
  const db = await getTestDb();
  
  const admin = {
    email: `admin${Date.now()}@test.com`,
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', // 'password'
    first_name: 'Test',
    last_name: 'Admin',
    phone: '+1234567890',
    is_active: true,
    ...overrides,
  };
  
  const result = await db.query(
    `INSERT INTO platform_admins (email, password_hash, first_name, last_name, phone, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [admin.email, admin.password_hash, admin.first_name, admin.last_name, admin.phone, admin.is_active]
  );
  
  return result.rows[0];
}

/**
 * Create a test platform staff (core DB)
 */
export async function createTestPlatformStaff(overrides: any = {}): Promise<any> {
  const db = await getTestDb();
  
  const staff = {
    email: `staff${Date.now()}@test.com`,
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', // 'password'
    first_name: 'Test',
    last_name: 'Staff',
    phone: '+1234567890',
    role: 'support',
    department: 'support',
    is_active: true,
    ...overrides,
  };
  
  const result = await db.query(
    `INSERT INTO platform_staff (email, password_hash, first_name, last_name, phone, role, department, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [staff.email, staff.password_hash, staff.first_name, staff.last_name, staff.phone, staff.role, staff.department, staff.is_active]
  );
  
  return result.rows[0];
}

/**
 * Create a test library staff (tenant DB)
 */
export async function createTestLibraryStaff(tenantId: string, overrides: any = {}): Promise<any> {
  const tenantDb = await tenantDbManager.getTenantConnection(tenantId);
  
  const staff = {
    email: `staff${Date.now()}@test.com`,
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', // 'password'
    first_name: 'Test',
    last_name: 'Staff',
    phone: '+1234567890',
    role: 'manager',
    staff_type: 'manager',
    is_active: true,
    ...overrides,
  };
  
  const result = await tenantDb.query(
    `INSERT INTO library_staff (tenant_id, email, password_hash, first_name, last_name, phone, role, staff_type, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [tenantId, staff.email, staff.password_hash, staff.first_name, staff.last_name, staff.phone, staff.role, staff.staff_type, staff.is_active]
  );
  
  return result.rows[0];
}

/**
 * Close test database connections
 */
export async function closeTestDb(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

