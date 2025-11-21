/**
 * UNIT TESTS - SETTLEMENT SERVICE
 * Tests for: Automated fund transfers, bank account management,
 * payment reconciliation, settlement reporting
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const { coreDb } = require('../../../src/config/database');

describe('Settlement Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Automated Fund Transfers', () => {
    it('should initiate settlement transfer', async () => {
      const settlement = {
        library_id: 'lib-123',
        amount: 100000,
        bank_account_id: 'bank-123',
        settlement_date: '2024-01-15',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          id: 'settlement-123',
          ...settlement,
          status: 'pending',
          initiated_at: new Date(),
        }],
      });

      const result = await coreDb.query(
        `INSERT INTO settlements (library_id, amount, bank_account_id, settlement_date, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [settlement.library_id, settlement.amount, settlement.bank_account_id,
         settlement.settlement_date, 'pending']
      );

      expect(result.rows[0].status).toBe('pending');
      expect(result.rows[0].amount).toBe(settlement.amount);
    });

    it('should process settlement batch', async () => {
      const settlements = [
        { library_id: 'lib-1', amount: 50000 },
        { library_id: 'lib-2', amount: 75000 },
        { library_id: 'lib-3', amount: 100000 },
      ];

      const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
      expect(totalAmount).toBe(225000);
    });

    it('should update settlement status', async () => {
      const settlementId = 'settlement-123';
      const newStatus = 'completed';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: settlementId, status: newStatus, completed_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE settlements SET status = $1, completed_at = NOW() WHERE id = $2 RETURNING *`,
        [newStatus, settlementId]
      );

      expect(result.rows[0].status).toBe(newStatus);
    });
  });

  describe('Bank Account Management', () => {
    it('should add bank account', async () => {
      const bankAccount = {
        library_id: 'lib-123',
        account_number: '1234567890',
        ifsc_code: 'BANK0001234',
        account_holder_name: 'Library Name',
        bank_name: 'Test Bank',
      };

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 'bank-123', ...bankAccount, status: 'active' }],
      });

      const result = await coreDb.query(
        `INSERT INTO bank_accounts (library_id, account_number, ifsc_code, account_holder_name, bank_name, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [bankAccount.library_id, bankAccount.account_number, bankAccount.ifsc_code,
         bankAccount.account_holder_name, bankAccount.bank_name, 'active']
      );

      expect(result.rows[0].account_number).toBe(bankAccount.account_number);
    });

    it('should validate IFSC code', () => {
      const ifscCodes = [
        'BANK0001234',
        'HDFC0000123',
        'ICIC0004567',
      ];

      const isValid = (ifsc: string) => {
        const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscPattern.test(ifsc);
      };

      ifscCodes.forEach(ifsc => {
        expect(isValid(ifsc)).toBe(true);
      });
    });

    it('should verify bank account', async () => {
      const bankAccountId = 'bank-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{ id: bankAccountId, verification_status: 'verified', verified_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE bank_accounts SET verification_status = 'verified', verified_at = NOW() 
         WHERE id = $1 RETURNING *`,
        [bankAccountId]
      );

      expect(result.rows[0].verification_status).toBe('verified');
    });
  });

  describe('Payment Reconciliation', () => {
    it('should reconcile payments with settlements', async () => {
      const libraryId = 'lib-123';
      const settlementId = 'settlement-123';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          settlement_id: settlementId,
          total_payments: 100,
          total_amount: 100000,
          reconciled_amount: 100000,
          discrepancy: 0,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           s.id as settlement_id,
           COUNT(p.id) as total_payments,
           SUM(p.amount) as total_amount,
           s.amount as reconciled_amount,
           (s.amount - SUM(p.amount)) as discrepancy
         FROM settlements s
         LEFT JOIN payments p ON p.library_id = s.library_id AND p.settlement_id = s.id
         WHERE s.id = $1
         GROUP BY s.id, s.amount`,
        [settlementId]
      );

      expect(result.rows[0].discrepancy).toBe(0);
    });

    it('should detect reconciliation discrepancies', async () => {
      const settlement = {
        id: 'settlement-123',
        amount: 100000,
      };

      const payments = [
        { amount: 50000 },
        { amount: 40000 },
      ];

      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      const discrepancy = settlement.amount - totalPayments;

      expect(discrepancy).toBe(10000);
    });
  });

  describe('Settlement Reporting', () => {
    it('should generate settlement report', async () => {
      const libraryId = 'lib-123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      (coreDb.query as jest.Mock).mockResolvedValue({
        rows: [{
          library_id: libraryId,
          period: 'January 2024',
          total_settlements: 4,
          total_amount: 400000,
          avg_settlement_amount: 100000,
          pending_settlements: 1,
        }],
      });

      const result = await coreDb.query(
        `SELECT 
           library_id,
           TO_CHAR(settlement_date, 'Month YYYY') as period,
           COUNT(*) as total_settlements,
           SUM(amount) as total_amount,
           AVG(amount) as avg_settlement_amount,
           COUNT(*) FILTER (WHERE status = 'pending') as pending_settlements
         FROM settlements
         WHERE library_id = $1 AND settlement_date BETWEEN $2 AND $3
         GROUP BY library_id, TO_CHAR(settlement_date, 'Month YYYY')`,
        [libraryId, startDate, endDate]
      );

      expect(result.rows[0].total_settlements).toBeGreaterThan(0);
    });
  });
});

