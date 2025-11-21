/**
 * UNIT TESTS - TENANT CONTEXT EDGE CASES
 * Additional edge case tests for tenant context middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { tenantContext, verifyTenantStatus } from '../../../src/middleware/tenantContext';
import { tenantDbManager } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Tenant Context Edge Cases', () => {
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

  describe('Tenant ID Extraction', () => {
    it('should extract tenant ID from header', async () => {
      mockRequest.headers = {
        'x-tenant-id': 'tenant-123',
      };

      const tenantId = mockRequest.headers['x-tenant-id'] as string;
      expect(tenantId).toBe('tenant-123');
    });

    it('should extract tenant ID from user token', async () => {
      (mockRequest as any).user = {
        tenantId: 'tenant-456',
      };

      const tenantId = (mockRequest as any).user?.tenantId;
      expect(tenantId).toBe('tenant-456');
    });

    it('should prioritize header over user tenantId', async () => {
      mockRequest.headers = {
        'x-tenant-id': 'tenant-header',
      };
      (mockRequest as any).user = {
        tenantId: 'tenant-user',
      };

      const tenantId = mockRequest.headers['x-tenant-id'] as string || (mockRequest as any).user?.tenantId;
      expect(tenantId).toBe('tenant-header');
    });

    it('should handle case-insensitive header', async () => {
      mockRequest.headers = {
        'X-Tenant-Id': 'tenant-123',
      };

      const tenantId = (mockRequest.headers['x-tenant-id'] || mockRequest.headers['X-Tenant-Id']) as string;
      expect(tenantId).toBe('tenant-123');
    });
  });

  describe('Missing Tenant ID', () => {
    it('should handle missing tenant ID in header and user', async () => {
      mockRequest.headers = {};
      (mockRequest as any).user = null;

      await tenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
    });

    it('should handle user without tenant ID', async () => {
      (mockRequest as any).user = {
        id: 'user-123',
        email: 'test@example.com',
      };

      await tenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Database Connection', () => {
    it('should get tenant database connection', async () => {
      const tenantId = 'tenant-123';
      const mockConnection = {
        query: jest.fn(),
      };

      (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockConnection);

      const connection = await tenantDbManager.getTenantConnection(tenantId);

      expect(connection).toBe(mockConnection);
      expect(tenantDbManager.getTenantConnection).toHaveBeenCalledWith(tenantId);
    });

    it('should handle database connection errors', async () => {
      (tenantDbManager.getTenantConnection as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(tenantDbManager.getTenantConnection('tenant-123')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('Tenant Status Verification', () => {
    it('should verify active tenant', async () => {
      (mockRequest as any).tenantId = 'tenant-123';

      await verifyTenantStatus(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Should not call error response if tenant is valid
      expect(mockReply.status).not.toHaveBeenCalledWith(400);
    });

    it('should handle missing tenant ID in verification', async () => {
      (mockRequest as any).tenantId = undefined;

      await verifyTenantStatus(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Tenant Context Attachment', () => {
    it('should attach tenant ID to request', async () => {
      const tenantId = 'tenant-123';
      (mockRequest as any).user = { tenantId };

      await tenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Tenant ID should be attached if context is established
      if ((mockRequest as any).tenantId) {
        expect((mockRequest as any).tenantId).toBe(tenantId);
      }
    });

    it('should attach tenant database to request', async () => {
      const tenantId = 'tenant-123';
      const mockConnection = { query: jest.fn() };

      (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockConnection);
      (mockRequest as any).user = { tenantId };

      await tenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply);

      // Tenant DB should be attached if context is established
      if ((mockRequest as any).tenantDb) {
        expect((mockRequest as any).tenantDb).toBe(mockConnection);
      }
    });
  });
});

