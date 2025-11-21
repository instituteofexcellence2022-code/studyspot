/**
 * UNIT TESTS - AUTHENTICATION MIDDLEWARE EDGE CASES
 * Additional edge case tests for authentication middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, requirePermission, requireRole } from '../../../src/middleware/auth';
import { AuthenticationError, AuthorizationError } from '../../../src/utils/errors';
import jwt from 'jsonwebtoken';

// Mock fastify-jwt
jest.mock('@fastify/jwt', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock JWT secret
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';

describe('Authentication Middleware Edge Cases', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Expiry', () => {
    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123', exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET!
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      // Mock jwtVerify to throw expired error
      const { jwtVerify } = require('@fastify/jwt');
      jwtVerify.mockRejectedValue(new Error('Token expired'));

      await expect(
        authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow();
    });

    it('should handle malformed tokens', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      const { jwtVerify } = require('@fastify/jwt');
      jwtVerify.mockRejectedValue(new Error('Invalid token'));

      await expect(
        authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow();
    });
  });

  describe('Missing Token', () => {
    it('should reject requests without authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalled();
    });

    it('should reject requests with invalid authorization format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Permission Checks', () => {
    it('should allow access with required permission', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        permissions: ['read:users', 'write:users'],
      };

      const next = jest.fn();

      requirePermission('read:users')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access without required permission', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        permissions: ['read:users'],
      };

      const next = jest.fn();

      requirePermission('write:users')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle wildcard permissions', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        permissions: ['*'],
      };

      const next = jest.fn();

      requirePermission('any:permission')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Role Checks', () => {
    it('should allow access with required role', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        role: 'admin',
      };

      const next = jest.fn();

      requireRole('admin')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access without required role', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        role: 'student',
      };

      const next = jest.fn();

      requireRole('admin')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle multiple roles', () => {
      (mockRequest as any).user = {
        id: 'user-123',
        roles: ['student', 'library_owner'],
      };

      const next = jest.fn();

      requireRole('library_owner')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('User Context', () => {
    it('should attach user to request after authentication', async () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', role: 'student' },
        process.env.JWT_SECRET!
      );

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      const { jwtVerify } = require('@fastify/jwt');
      jwtVerify.mockResolvedValue({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'student',
      });

      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect((mockRequest as any).user).toBeDefined();
    });

    it('should handle missing user gracefully', () => {
      const next = jest.fn();

      requirePermission('read:users')(mockRequest as FastifyRequest, mockReply as FastifyReply, next);

      expect(mockReply.status).toHaveBeenCalledWith(401);
    });
  });
});

