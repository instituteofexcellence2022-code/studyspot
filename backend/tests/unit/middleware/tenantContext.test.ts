/**
 * UNIT TESTS - TENANT CONTEXT MIDDLEWARE
 * Tests for tenant context middleware
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { setTenantContext } from '../../../src/middleware/tenantContext';

// Mock dependencies
jest.mock('../../../src/config/database');
jest.mock('../../../src/utils/logger');

describe('Tenant Context Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    } as any;

    mockReply = {} as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set tenant context from header', async () => {
    mockRequest.headers = {
      'x-tenant-id': 'tenant-123',
    };

    await setTenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply, jest.fn());

    expect((mockRequest as any).tenantId).toBe('tenant-123');
  });

  it('should set tenant context from user', async () => {
    (mockRequest as any).user = {
      tenantId: 'tenant-456',
    };

    await setTenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply, jest.fn());

    expect((mockRequest as any).tenantId).toBe('tenant-456');
  });

  it('should prioritize header over user tenantId', async () => {
    mockRequest.headers = {
      'x-tenant-id': 'tenant-header',
    };
    (mockRequest as any).user = {
      tenantId: 'tenant-user',
    };

    await setTenantContext(mockRequest as FastifyRequest, mockReply as FastifyReply, jest.fn());

    expect((mockRequest as any).tenantId).toBe('tenant-header');
  });
});

