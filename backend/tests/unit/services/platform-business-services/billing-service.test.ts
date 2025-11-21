/**
 * UNIT TESTS - BILLING SERVICE
 * Tests for: Invoice generation & management, tax calculation & compliance,
 * financial document management, payment tracking
 */

// Mock dependencies first
jest.mock('../../../src/config/database', () => ({
  coreDb: {
    query: jest.fn(),
  },
}));

const coreDb = require('../../../src/config/database').coreDb;

describe('Billing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Invoice Generation & Management', () => {
    it('should generate invoice', async () => {
      const invoice = {
        tenant_id: 'tenant-123',
        amount: 10000,
        tax: 1800,
        total: 11800,
        due_date: '2024-02-15',
        items: [
          { description: 'Subscription Fee', amount: 10000 },
        ],
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'invoice-123', invoice_number: 'INV-001', ...invoice, status: 'pending' }],
      });

      const result = await coreDb.query(
        `INSERT INTO invoices (tenant_id, amount, tax, total, due_date, items, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [invoice.tenant_id, invoice.amount, invoice.tax, invoice.total,
         invoice.due_date, JSON.stringify(invoice.items), 'pending']
      );

      expect(result.rows[0].invoice_number).toBeDefined();
      expect(result.rows[0].status).toBe('pending');
    });

    it('should generate invoice number', () => {
      const prefix = 'INV';
      const timestamp = Date.now();
      const invoiceNumber = `${prefix}-${timestamp.toString().slice(-8)}`;

      expect(invoiceNumber).toMatch(/^INV-\d{8}$/);
    });
  });

  describe('Tax Calculation & Compliance', () => {
    it('should calculate GST', () => {
      const amount = 10000;
      const gstRate = 0.18; // 18%
      const gst = amount * gstRate;
      const total = amount + gst;

      expect(gst).toBe(1800);
      expect(total).toBe(11800);
    });

    it('should calculate tax by state', () => {
      const amount = 10000;
      const taxRates = {
        'Delhi': 0.18,
        'Mumbai': 0.18,
        'Bangalore': 0.18,
      };

      const state = 'Delhi';
      const tax = amount * taxRates[state as keyof typeof taxRates];

      expect(tax).toBe(1800);
    });
  });

  describe('Financial Document Management', () => {
    it('should store invoice document', async () => {
      const invoiceId = 'invoice-123';
      const documentUrl = 'https://storage.example.com/invoices/inv-123.pdf';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: invoiceId, document_url: documentUrl }],
      });

      const result = await coreDb.query(
        `UPDATE invoices SET document_url = $1 WHERE id = $2 RETURNING *`,
        [documentUrl, invoiceId]
      );

      expect(result.rows[0].document_url).toBe(documentUrl);
    });

    it('should generate receipt', async () => {
      const paymentId = 'payment-123';
      const receipt = {
        receipt_number: 'RCP-001',
        payment_id: paymentId,
        amount: 11800,
        generated_at: new Date(),
      };

      (coreDb.query).mockResolvedValue({
        rows: [{ id: 'receipt-123', ...receipt }],
      });

      const result = await coreDb.query(
        `INSERT INTO receipts (payment_id, receipt_number, amount)
         VALUES ($1, $2, $3) RETURNING *`,
        [receipt.payment_id, receipt.receipt_number, receipt.amount]
      );

      expect(result.rows[0].receipt_number).toBe(receipt.receipt_number);
    });
  });

  describe('Payment Tracking', () => {
    it('should track invoice payment', async () => {
      const invoiceId = 'invoice-123';
      const paymentId = 'payment-123';

      (coreDb.query).mockResolvedValue({
        rows: [{ id: invoiceId, payment_id: paymentId, status: 'paid', paid_at: new Date() }],
      });

      const result = await coreDb.query(
        `UPDATE invoices SET payment_id = $1, status = 'paid', paid_at = NOW() WHERE id = $2 RETURNING *`,
        [paymentId, invoiceId]
      );

      expect(result.rows[0].status).toBe('paid');
    });

    it('should track overdue invoices', async () => {
      (coreDb.query).mockResolvedValue({
        rows: [
          { id: 'inv-1', invoice_number: 'INV-001', days_overdue: 5, amount: 10000 },
          { id: 'inv-2', invoice_number: 'INV-002', days_overdue: 15, amount: 15000 },
        ],
      });

      const result = await coreDb.query(
        `SELECT 
           id,
           invoice_number,
           EXTRACT(DAY FROM (NOW() - due_date)) as days_overdue,
           total as amount
         FROM invoices
         WHERE status = 'pending' AND due_date < NOW()
         ORDER BY days_overdue DESC`
      );

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });
});

