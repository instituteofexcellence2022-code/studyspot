/**
 * TEST AUTHENTICATION HELPERS
 * Utilities for generating test tokens and auth headers
 */

const jwt = require('jsonwebtoken');
const { createTestUser, createTestTenant } = require('./testDb');

/**
 * Generate a JWT token for testing
 * @param {object} payload - Token payload
 * @param {string} expiresIn - Token expiry
 * @returns {string} JWT token
 */
const generateTestToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate an expired token for testing
 * @param {object} payload - Token payload
 * @returns {string} Expired JWT token
 */
const generateExpiredToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1h' });
};

/**
 * Generate an invalid token for testing
 * @returns {string} Invalid JWT token
 */
const generateInvalidToken = () => {
  return jwt.sign({ id: 'test' }, 'wrong-secret');
};

/**
 * Create a test user and return with auth token
 * @param {object} overrides - User overrides
 * @returns {Promise<{user, token, headers}>}
 */
const createAuthenticatedUser = async (overrides = {}) => {
  const user = await createTestUser(overrides);
  
  const token = generateTestToken({
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id
  });

  const headers = {
    Authorization: `Bearer ${token}`
  };

  return { user, token, headers };
};

/**
 * Create a complete authenticated test environment
 * @param {object} options - Configuration options
 * @returns {Promise<{tenant, user, token, headers}>}
 */
const createAuthenticatedEnvironment = async (options = {}) => {
  const tenant = await createTestTenant(options.tenant || {});
  const user = await createTestUser({
    tenant_id: tenant.id,
    ...options.user
  });

  const token = generateTestToken({
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id
  });

  const headers = {
    Authorization: `Bearer ${token}`
  };

  return { tenant, user, token, headers };
};

/**
 * Create admin user with token
 */
const createAuthenticatedAdmin = async () => {
  return createAuthenticatedUser({ role: 'admin' });
};

/**
 * Create super admin user with token
 */
const createAuthenticatedSuperAdmin = async () => {
  return createAuthenticatedUser({ role: 'super_admin' });
};

module.exports = {
  generateTestToken,
  generateExpiredToken,
  generateInvalidToken,
  createAuthenticatedUser,
  createAuthenticatedEnvironment,
  createAuthenticatedAdmin,
  createAuthenticatedSuperAdmin
};




