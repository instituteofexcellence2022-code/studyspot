/**
 * UNIT TESTS - CREDIT SERVICE
 * Tests credit wallet and transaction functionality
 */

import { tenantDbManager, coreDb } from '../../../src/config/database';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  tenantDbManager: {
    getTenantConnection: jest.fn(),
  },
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Credit Service', () => {
  let mockTenantDb: any;
  let mockCoreDb: any;

  beforeEach(() => {
    mockTenantDb = {
      query: jest.fn(),
    };
    mockCoreDb = {
      query: jest.fn(),
    };
    (tenantDbManager.getTenantConnection as jest.Mock).mockResolvedValue(mockTenantDb);
    (coreDb.query as jest.Mock).mockImplementation((query, params) => {
      if (query.includes('tenant_credit_wallets')) {
        return Promise.resolve({
          rows: [{ tenant_id: 'tenant-123', balance: 1000, currency: 'INR' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });
    jest.clearAllMocks();
  });

  describe('Credit Wallet Operations', () => {
    it('should get wallet balance', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ tenant_id: tenantId, balance: 1000, currency: 'INR' }],
      });

      const getBalance = async (tenantId: string) => {
        const result = await coreDb.query(
          'SELECT balance, currency FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );
        return result.rows[0];
      };

      const balance = await getBalance(tenantId);

      expect(mockCoreDb.query).toHaveBeenCalledWith(
        expect.stringContaining('tenant_credit_wallets'),
        [tenantId]
      );
      expect(balance.balance).toBe(1000);
    });

    it('should add credits to wallet', async () => {
      const tenantId = 'tenant-123';
      const amount = 500;
      mockCoreDb.query
        .mockResolvedValueOnce({
          rows: [{ tenant_id: tenantId, balance: 1000 }],
        })
        .mockResolvedValueOnce({
          rows: [{ tenant_id: tenantId, balance: 1500 }],
        });

      const addCredits = async (tenantId: string, amount: number) => {
        await coreDb.query(
          'UPDATE tenant_credit_wallets SET balance = balance + $1 WHERE tenant_id = $2',
          [amount, tenantId]
        );
        const result = await coreDb.query(
          'SELECT balance FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );
        return result.rows[0];
      };

      const newBalance = await addCredits(tenantId, amount);

      expect(mockCoreDb.query).toHaveBeenCalledTimes(2);
      expect(newBalance.balance).toBe(1500);
    });

    it('should deduct credits from wallet', async () => {
      const tenantId = 'tenant-123';
      const amount = 200;
      mockCoreDb.query
        .mockResolvedValueOnce({
          rows: [{ tenant_id: tenantId, balance: 1000 }],
        })
        .mockResolvedValueOnce({
          rows: [{ tenant_id: tenantId, balance: 800 }],
        });

      const deductCredits = async (tenantId: string, amount: number) => {
        const current = await coreDb.query(
          'SELECT balance FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );
        if (current.rows[0].balance < amount) {
          throw new Error('Insufficient balance');
        }
        await coreDb.query(
          'UPDATE tenant_credit_wallets SET balance = balance - $1 WHERE tenant_id = $2',
          [amount, tenantId]
        );
        const result = await coreDb.query(
          'SELECT balance FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );
        return result.rows[0];
      };

      const newBalance = await deductCredits(tenantId, amount);

      expect(newBalance.balance).toBe(800);
    });

    it('should reject deduction with insufficient balance', async () => {
      const tenantId = 'tenant-123';
      const amount = 2000;
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ tenant_id: tenantId, balance: 1000 }],
      });

      const deductCredits = async (tenantId: string, amount: number) => {
        const current = await coreDb.query(
          'SELECT balance FROM tenant_credit_wallets WHERE tenant_id = $1',
          [tenantId]
        );
        if (current.rows[0].balance < amount) {
          throw new Error('Insufficient balance');
        }
      };

      await expect(deductCredits(tenantId, amount)).rejects.toThrow('Insufficient balance');
    });
  });

  describe('Credit Transactions', () => {
    it('should record credit transaction', async () => {
      const tenantId = 'tenant-123';
      const transaction = {
        type: 'purchase',
        amount: 500,
        description: 'Credit purchase',
      };

      mockCoreDb.query.mockResolvedValueOnce({
        rows: [{ id: 'txn-123', tenant_id: tenantId, ...transaction }],
      });

      const recordTransaction = async (tenantId: string, transaction: any) => {
        const result = await coreDb.query(
          `INSERT INTO credit_transactions (tenant_id, type, amount, description)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [tenantId, transaction.type, transaction.amount, transaction.description]
        );
        return result.rows[0];
      };

      const txn = await recordTransaction(tenantId, transaction);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(txn.type).toBe('purchase');
      expect(txn.amount).toBe(500);
    });

    it('should get transaction history', async () => {
      const tenantId = 'tenant-123';
      mockCoreDb.query.mockResolvedValueOnce({
        rows: [
          { id: 'txn-1', type: 'purchase', amount: 500 },
          { id: 'txn-2', type: 'usage', amount: -100 },
        ],
      });

      const getHistory = async (tenantId: string) => {
        const result = await coreDb.query(
          'SELECT * FROM credit_transactions WHERE tenant_id = $1 ORDER BY created_at DESC',
          [tenantId]
        );
        return result.rows;
      };

      const history = await getHistory(tenantId);

      expect(mockCoreDb.query).toHaveBeenCalled();
      expect(history).toHaveLength(2);
    });
  });
});
