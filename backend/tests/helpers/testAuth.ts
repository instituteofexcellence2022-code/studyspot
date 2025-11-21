/**
 * TEST AUTHENTICATION HELPERS
 * Utilities for creating test tokens and authenticated requests
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens';

/**
 * Create a test JWT token
 */
export function createTestToken(payload: any = {}): string {
  const defaultPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'student',
    userType: 'student',
    userTable: 'students',
    tenantId: 'test-tenant-id',
    permissions: [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };

  const tokenPayload = { ...defaultPayload, ...payload };
  return jwt.sign(tokenPayload, JWT_SECRET);
}

/**
 * Create an authenticated request header
 */
export function createAuthHeader(token?: string): { Authorization: string } {
  const authToken = token || createTestToken();
  return {
    Authorization: `Bearer ${authToken}`,
  };
}

/**
 * Create a test token for a specific role
 */
export function createRoleToken(role: string, tenantId?: string): string {
  const roleConfig: Record<string, any> = {
    student: {
      userType: 'student',
      userTable: 'students',
    },
    library_owner: {
      userType: 'library_owner',
      userTable: 'library_owners',
    },
    library_staff: {
      userType: 'library_staff',
      userTable: 'library_staff',
    },
    platform_admin: {
      userType: 'platform_admin',
      userTable: 'platform_admins',
      permissions: ['*'],
    },
    platform_staff: {
      userType: 'platform_staff',
      userTable: 'platform_staff',
      permissions: ['read:users', 'read:tenants'],
    },
    admin: {
      userType: 'platform_admin',
      userTable: 'platform_admins',
      permissions: ['read:users', 'write:users'],
    },
  };

  const config = roleConfig[role] || roleConfig.student;

  return createTestToken({
    role,
    tenantId: tenantId || (role === 'platform_admin' || role === 'platform_staff' || role === 'admin' ? null : 'test-tenant-id'),
    ...config,
  });
}

/**
 * Create test tokens for all 5 user types
 */
export const testTokens = {
  student: (tenantId: string) => createRoleToken('student', tenantId),
  libraryOwner: (tenantId: string) => createRoleToken('library_owner', tenantId),
  libraryStaff: (tenantId: string) => createRoleToken('library_staff', tenantId),
  platformAdmin: () => createRoleToken('platform_admin'),
  platformStaff: () => createRoleToken('platform_staff'),
};

