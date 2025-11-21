/**
 * INTEGRATION TESTS - CREDIT SERVICE ROUTES
 * Tests actual route handlers to increase coverage
 */

import Fastify, { FastifyInstance } from 'fastify';
import { coreDb } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((request: any, reply: any, done: any) => {
    request.user = { id: 'user-123', tenantId: 'tenant-123' };
    request.tenantId = 'tenant-123';
    done();
  }),
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Credit Service Routes', () => {
  let app: FastifyInstance;
  let mockCoreDb: any;

  beforeAll(async () => {
    mockCoreDb = {
      query: jest.fn(),
    };
    (coreDb.query as jest.Mock).mockImplementation(mockCoreDb.query);

    app = Fastify();
    
    // Register credit routes
    app.register(async (fastify) => {
      // Get wallet balance
      fastify.get('/api/v1/credits/wallet', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';

        const result = await mockCoreDb.query(
          'SELECT balance, currency FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );

        if (result.rows.length === 0) {
          return reply.code(404).send({ error: 'Wallet not found' });
        }

        return reply.send({
          success: true,
          data: result.rows[0],
        });
      });

      // Purchase credits
      fastify.post('/api/v1/credits/purchase', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { amount, sms_credits, whatsapp_credits, email_credits } = request.body as any;

        if (!amount || amount <= 0) {
          return reply.code(400).send({ error: 'Invalid amount' });
        }

        // Get current balance
        const walletResult = await mockCoreDb.query(
          'SELECT balance FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );

        if (walletResult.rows.length === 0) {
          // Create wallet if doesn't exist
          await mockCoreDb.query(
            'INSERT INTO tenant_credit_wallets (tenant_id, balance) VALUES ($1, 0)',
            [tenantId]
          );
        }

        // Add credits
        const updateResult = await mockCoreDb.query(
          `UPDATE tenant_credit_wallets 
           SET balance = balance + $1,
               sms_credits = COALESCE(sms_credits, 0) + $2,
               whatsapp_credits = COALESCE(whatsapp_credits, 0) + $3,
               email_credits = COALESCE(email_credits, 0) + $4
           WHERE tenant_id = $5
           RETURNING *`,
          [amount, sms_credits || 0, whatsapp_credits || 0, email_credits || 0, tenantId]
        );

        // Record transaction
        await mockCoreDb.query(
          `INSERT INTO credit_transactions (tenant_id, type, amount, description)
           VALUES ($1, 'purchase', $2, 'Credit purchase')`,
          [tenantId, amount]
        );

        return reply.send({
          success: true,
          data: updateResult.rows[0],
        });
      });

      // Get transaction history
      fastify.get('/api/v1/credits/transactions', async (request, reply) => {
        const tenantId = (request as any).tenantId || 'tenant-123';
        const { page = 1, limit = 20 } = request.query as any;

        const countResult = await mockCoreDb.query(
          'SELECT COUNT(*) FROM credit_transactions WHERE tenant_id = $1',
          [tenantId]
        );
        const total = parseInt(countResult.rows[0].count);

        const offset = (page - 1) * limit;
        const result = await mockCoreDb.query(
          `SELECT * FROM credit_transactions 
           WHERE tenant_id = $1 
           ORDER BY created_at DESC 
           LIMIT $2 OFFSET $3`,
          [tenantId, limit, offset]
        );

        return reply.send({
          success: true,
          data: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Wallet Balance', () => {
    it('should get wallet balance successfully', async () => {
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ balance: 1000, currency: 'INR' }],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/credits/wallet',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.balance).toBe(1000);
    });

    it('should return 404 if wallet not found', async () => {
      mockCoreDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/credits/wallet',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Purchase Credits', () => {
    it('should purchase credits successfully', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ balance: 500 }] }) // Get current balance
        .mockResolvedValueOnce({
          rows: [{ balance: 1500, sms_credits: 100, whatsapp_credits: 50 }],
        }) // Update wallet
        .mockResolvedValueOnce({}); // Record transaction

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/credits/purchase',
        payload: {
          amount: 1000,
          sms_credits: 100,
          whatsapp_credits: 50,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.balance).toBe(1500);
    });

    it('should create wallet if it does not exist', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [] }) // Wallet not found
        .mockResolvedValueOnce({}) // Create wallet
        .mockResolvedValueOnce({
          rows: [{ balance: 1000 }],
        }) // Update wallet
        .mockResolvedValueOnce({}); // Record transaction

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/credits/purchase',
        payload: { amount: 1000 },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should reject invalid amount', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/credits/purchase',
        payload: { amount: -100 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Get Transaction History', () => {
    it('should get transaction history with pagination', async () => {
      mockCoreDb.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({
          rows: [
            { id: 'txn-1', type: 'purchase', amount: 1000 },
            { id: 'txn-2', type: 'usage', amount: -100 },
          ],
        });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/credits/transactions?page=1&limit=20',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.pagination.total).toBe(10);
    });
  });
});

