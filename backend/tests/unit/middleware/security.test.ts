/**
 * UNIT TESTS - SECURITY MIDDLEWARE
 * Tests for security middleware functions
 */

// Mock logger first
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock database
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

import { FastifyRequest, FastifyReply } from 'fastify';
import { requireAdmin, requireSuperAdmin, checkIpWhitelist, auditLog, validateTenantAccess } from '../../../src/middleware/security';
import { logger } from '../../../src/utils/logger';

describe('Security Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      url: '/api/v1/admin/users',
      method: 'GET',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '192.168.1.1',
      },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('requireAdmin', () => {
    it('should allow platform admin access', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        userType: 'platform_admin',
        role: 'admin',
        roles: ['admin'],
      };

      await requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
      expect((mockRequest as any).isAdmin).toBe(true);
    });

    it('should reject non-admin users', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        userType: 'student',
        role: 'student',
        roles: ['student'],
      };

      await requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      mockRequest.user = undefined;

      await requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
    });

    it('should allow super_admin role', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        userType: 'platform_admin',
        role: 'super_admin',
        roles: ['super_admin'],
      };

      await requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should allow support role', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        userType: 'platform_admin',
        role: 'support',
        roles: ['support'],
      };

      await requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });
  });

  describe('requireSuperAdmin', () => {
    it('should allow super admin access', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        role: 'super_admin',
        roles: ['super_admin'],
      };

      await requireSuperAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
      expect((mockRequest as any).isSuperAdmin).toBe(true);
    });

    it('should reject non-super-admin users', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        role: 'admin',
        roles: ['admin'],
      };

      await requireSuperAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      mockRequest.user = undefined;

      await requireSuperAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
    });
  });

  describe('checkIpWhitelist', () => {
    it('should allow IPs in whitelist', async () => {
      const whitelist = ['127.0.0.1', '192.168.1.1'];
      const middleware = checkIpWhitelist(whitelist);

      mockRequest.ip = '127.0.0.1';

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalled();
    });

    it('should reject IPs not in whitelist', async () => {
      const whitelist = ['127.0.0.1', '192.168.1.1'];
      const middleware = checkIpWhitelist(whitelist);

      mockRequest.ip = '10.0.0.1';

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should allow all IPs when whitelist is empty', async () => {
      const whitelist: string[] = [];
      const middleware = checkIpWhitelist(whitelist);

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalled();
    });

    it('should extract IP from x-forwarded-for header', async () => {
      const whitelist = ['192.168.1.1'];
      const middleware = checkIpWhitelist(whitelist);

      mockRequest.ip = undefined;
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      };

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalled();
    });

    it('should extract IP from x-real-ip header', async () => {
      const whitelist = ['192.168.1.2'];
      const middleware = checkIpWhitelist(whitelist);

      mockRequest.ip = undefined;
      mockRequest.headers = {
        'x-real-ip': '192.168.1.2',
      };

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalled();
    });
  });

  describe('auditLog', () => {
    it('should log sensitive operations', async () => {
      const { coreDb } = require('../../../src/config/database');
      coreDb.query.mockResolvedValue({ rows: [] });

      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
      };
      mockRequest.url = '/api/v1/admin/users';

      await auditLog(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(coreDb.query).toHaveBeenCalled();
    });

    it('should not log non-sensitive operations', async () => {
      const { coreDb } = require('../../../src/config/database');

      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
      };
      mockRequest.url = '/api/health';

      await auditLog(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(coreDb.query).not.toHaveBeenCalled();
    });

    it('should handle audit log errors gracefully', async () => {
      const { coreDb } = require('../../../src/config/database');
      coreDb.query.mockRejectedValue(new Error('Database error'));

      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
      };
      mockRequest.url = '/api/v1/admin/users';

      await auditLog(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(logger.error).toHaveBeenCalled();
      expect(mockReply.status).not.toHaveBeenCalled();
    });
  });

  describe('validateTenantAccess', () => {
    it('should allow super admin to access any tenant', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        role: 'super_admin',
        roles: ['super_admin'],
        tenantId: 'tenant-1',
      };
      (mockRequest as any).tenantId = 'tenant-2';

      await validateTenantAccess(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should allow user to access their own tenant', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        tenantId: 'tenant-1',
      };
      (mockRequest as any).tenantId = 'tenant-1';

      await validateTenantAccess(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalledWith(403);
    });

    it('should reject user accessing different tenant', async () => {
      mockRequest.user = {
        id: 'user-123',
        userId: 'user-123',
        tenantId: 'tenant-1',
      };
      (mockRequest as any).tenantId = 'tenant-2';

      await validateTenantAccess(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should skip validation when no tenant context', async () => {
      (mockRequest as any).tenantId = undefined;

      await validateTenantAccess(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).not.toHaveBeenCalled();
    });
  });
});

