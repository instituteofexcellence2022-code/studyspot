/**
 * TEST DATABASE HELPERS
 * Utilities for managing test database state
 */

const { query, getClient } = require('../../src/config/database');
const bcrypt = require('bcryptjs');

/**
 * Clean all data from test database
 * Run this before each test suite to ensure clean state
 */
const cleanDatabase = async () => {
  const tables = [
    'audit_logs',
    'notifications',
    'invoices',
    'subscription_usage',
    'subscriptions',
    'credit_transactions',
    'bookings',
    'libraries',
    'user_roles',
    'role_permissions',
    'roles',
    'users',
    'tenants',
    'subscription_plans'
  ];

  for (const table of tables) {
    try {
      await query(`TRUNCATE TABLE ${table} CASCADE`);
    } catch (error) {
      // Table might not exist in all test environments
      console.warn(`Could not truncate ${table}:`, error.message);
    }
  }
};

/**
 * Create a test tenant
 */
const createTestTenant = async (overrides = {}) => {
  const result = await query(`
    INSERT INTO tenants (
      name, email, status, settings
    ) VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [
    overrides.name || 'Test Tenant',
    overrides.email || `tenant${Date.now()}@example.com`,
    overrides.status || 'active',
    overrides.settings || {}
  ]);

  return result.rows[0];
};

/**
 * Create a test user
 */
const createTestUser = async (overrides = {}) => {
  const hashedPassword = await bcrypt.hash(overrides.password || 'TestPass123!', 10);

  const result = await query(`
    INSERT INTO users (
      email, password, name, role, status, tenant_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    overrides.email || `user${Date.now()}@example.com`,
    hashedPassword,
    overrides.name || 'Test User',
    overrides.role || 'user',
    overrides.status || 'active',
    overrides.tenant_id || null
  ]);

  return result.rows[0];
};

/**
 * Create a test subscription plan
 */
const createTestPlan = async (overrides = {}) => {
  const result = await query(`
    INSERT INTO subscription_plans (
      name, display_name, description,
      price_monthly, price_yearly,
      features, limits, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    overrides.name || 'test_plan',
    overrides.display_name || 'Test Plan',
    overrides.description || 'A test subscription plan',
    overrides.price_monthly || 999,
    overrides.price_yearly || 9999,
    overrides.features || ['feature1', 'feature2'],
    overrides.limits || { users: 10, libraries: 5 },
    overrides.is_active !== undefined ? overrides.is_active : true
  ]);

  return result.rows[0];
};

/**
 * Create a test subscription
 */
const createTestSubscription = async (tenantId, planId, overrides = {}) => {
  const result = await query(`
    INSERT INTO subscriptions (
      tenant_id, plan_id, status, billing_cycle,
      current_period_start, current_period_end
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    tenantId,
    planId,
    overrides.status || 'active',
    overrides.billing_cycle || 'monthly',
    overrides.current_period_start || new Date(),
    overrides.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ]);

  return result.rows[0];
};

/**
 * Create a test library
 */
const createTestLibrary = async (tenantId, overrides = {}) => {
  const result = await query(`
    INSERT INTO libraries (
      tenant_id, name, address, city, status, capacity
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [
    tenantId,
    overrides.name || 'Test Library',
    overrides.address || '123 Test St',
    overrides.city || 'Test City',
    overrides.status || 'active',
    overrides.capacity || 100
  ]);

  return result.rows[0];
};

/**
 * Setup a complete test environment with tenant, user, and plan
 * Returns all created entities
 */
const setupTestEnvironment = async () => {
  const tenant = await createTestTenant();
  const user = await createTestUser({ tenant_id: tenant.id });
  const plan = await createTestPlan();

  return { tenant, user, plan };
};

module.exports = {
  cleanDatabase,
  createTestTenant,
  createTestUser,
  createTestPlan,
  createTestSubscription,
  createTestLibrary,
  setupTestEnvironment
};




