/**
 * UNIT TESTS - AUTHENTICATION MIDDLEWARE
 * Tests for authentication middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, AuthenticatedRequest, requireRole, requirePermission } from '../../../src/middleware/auth';
import { AuthenticationError, AuthorizationError } from '../../../src/utils/errors';
import { createTestToken, createRoleToken } from '../../helpers/testAuth';

// Mock Fastify JWT plugin
const mockJwtVerify = jest.fn();

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      jwtVerify: mockJwtVerify,
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate request with valid token', async () => {
      const token = createTestToken();
      mockRequest.headers = { authorization: `Bearer ${token}` };
      
      mockJwtVerify.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'student',
        userType: 'student',
        userTable: 'students',
        tenantId: 'tenant-123',
        permissions: [],
      });

      await authenticate(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

      expect(mockRequest.user).toBeDefined();
      expect((mockRequest.user as any)?.id).toBe('user-123');
      expect((mockRequest.user as any)?.email).toBe('test@example.com');
      expect((mockRequest as any).tenantId).toBe('tenant-123');
    });

    it('should throw AuthenticationError when no token provided', async () => {
      mockRequest.headers = {};

      await expect(
        authenticate(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      await expect(
        authenticate(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when token is expired', async () => {
      mockRequest.headers = { authorization: 'Bearer expired-token' };
      mockJwtVerify.mockRejectedValue({ name: 'TokenExpiredError' });

      await expect(
        authenticate(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError when tenantId is missing for tenant-specific user', async () => {
      mockRequest.headers = { authorization: 'Bearer token' };
      
      mockJwtVerify.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'student',
        userType: 'student',
        userTable: 'students',
        // No tenantId
      });

      await expect(
        authenticate(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', async () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        userType: 'platform_admin',
        userTable: 'admin_users',
        permissions: [],
      };

      const middleware = requireRole('admin', 'super_admin');
      await expect(
        middleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();
    });

    it('should throw AuthorizationError for user without required role', async () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'student',
        userType: 'student',
        userTable: 'students',
        permissions: [],
      };

      const middleware = requireRole('admin');
      await expect(
        middleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthorizationError);
    });

    it('should throw AuthenticationError when user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = requireRole('admin');
      await expect(
        middleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('requirePermission', () => {
    it('should allow access for user with required permission', async () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        userType: 'platform_admin',
        userTable: 'admin_users',
        permissions: ['read:users', 'write:users'],
      };

      const middleware = requirePermission('read:users');
      await expect(
        middleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();
    });

    it('should allow access for super admin with wildcard permission', async () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'super_admin',
        userType: 'platform_admin',
        userTable: 'admin_users',
        permissions: ['*'], // Wildcard permission
      };

      const middleware = requirePermission('read:users');
      await expect(
        middleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();
    });

    it('should throw AuthorizationError for user without required permission', async () => {
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
        userType: 'platform_admin',
        userTable: 'admin_users',
        permissions: ['read:users'], // Missing write:users
      };

      const middleware = requirePermission('write:users');
      await expect(
        middleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply)
      ).rejects.toThrow(AuthorizationError);
    });
  });
});

