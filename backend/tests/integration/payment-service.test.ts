/**
 * INTEGRATION TESTS - PAYMENT SERVICE
 * Tests for payment service endpoints
 */

import { createTestTenant, createTestStudent, cleanCoreDatabase, cleanTenantDatabase, closeTestDb } from '../helpers/testDb';
import { tenantDbManager } from '../../src/config/database';

describe('Payment Service Integration Tests', () => {
  let tenant: any;
  let student: any;

  beforeAll(async () => {
    await cleanCoreDatabase();
    tenant = await createTestTenant();
    student = await createTestStudent(tenant.id);
  });

  afterAll(async () => {
    if (tenant) {
      await cleanTenantDatabase(tenant.id);
    }
    await cleanCoreDatabase();
    await closeTestDb();
  });

  beforeEach(async () => {
    if (tenant) {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);
      await tenantDb.query('TRUNCATE TABLE payments CASCADE');
      await tenantDb.query('TRUNCATE TABLE payment_refunds CASCADE');
    }
  });

  describe('Payment CRUD Operations', () => {
    it('should create a payment', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      const paymentData = {
        tenant_id: tenant.id,
        amount: 1000,
        currency: 'INR',
        order_id: 'order-123',
        customer_id: student.id,
        status: 'pending',
        gateway: 'razorpay',
      };

      const result = await tenantDb.query(
        `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, status, gateway)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          paymentData.tenant_id,
          paymentData.amount,
          paymentData.currency,
          paymentData.order_id,
          paymentData.customer_id,
          paymentData.status,
          paymentData.gateway,
        ]
      );

      expect(result.rows[0]).toBeDefined();
      expect(result.rows[0].amount).toBe(paymentData.amount);
      expect(result.rows[0].status).toBe('pending');
    });

    it('should retrieve payment by ID', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create payment
      const createResult = await tenantDb.query(
        `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [tenant.id, 1000, 'INR', 'order-123', student.id, 'pending']
      );

      const paymentId = createResult.rows[0].id;

      // Retrieve payment
      const result = await tenantDb.query(
        'SELECT * FROM payments WHERE id = $1 AND tenant_id = $2',
        [paymentId, tenant.id]
      );

      expect(result.rows[0].id).toBe(paymentId);
    });

    it('should update payment status', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create payment
      const createResult = await tenantDb.query(
        `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [tenant.id, 1000, 'INR', 'order-123', student.id, 'pending']
      );

      const paymentId = createResult.rows[0].id;

      // Update status
      const updateResult = await tenantDb.query(
        'UPDATE payments SET status = $1, transaction_id = $2 WHERE id = $3 RETURNING *',
        ['paid', 'txn-123', paymentId]
      );

      expect(updateResult.rows[0].status).toBe('paid');
      expect(updateResult.rows[0].transaction_id).toBe('txn-123');
    });
  });

  describe('Payment Refunds', () => {
    it('should create a refund', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      // Create payment
      const paymentResult = await tenantDb.query(
        `INSERT INTO payments (tenant_id, amount, currency, order_id, customer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [tenant.id, 1000, 'INR', 'order-123', student.id, 'paid']
      );

      const paymentId = paymentResult.rows[0].id;

      // Create refund
      const refundResult = await tenantDb.query(
        `INSERT INTO payment_refunds (payment_id, amount, reason, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [paymentId, 500, 'Customer request', 'processed']
      );

      expect(refundResult.rows[0].amount).toBe(500);
      expect(refundResult.rows[0].status).toBe('processed');
    });
  });

  describe('Payment Preferences', () => {
    it('should save payment preferences', async () => {
      const tenantDb = await tenantDbManager.getTenantConnection(tenant.id);

      const preferences = {
        preferred_gateway: 'razorpay',
        auto_pay_enabled: true,
        auto_pay_threshold: 500,
      };

      const result = await tenantDb.query(
        `INSERT INTO student_payment_preferences (student_id, tenant_id, preferred_gateway, auto_pay_enabled, auto_pay_threshold)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id) DO UPDATE SET preferred_gateway = $3, auto_pay_enabled = $4, auto_pay_threshold = $5
         RETURNING *`,
        [student.id, tenant.id, preferences.preferred_gateway, preferences.auto_pay_enabled, preferences.auto_pay_threshold]
      );

      expect(result.rows[0].preferred_gateway).toBe('razorpay');
      expect(result.rows[0].auto_pay_enabled).toBe(true);
    });
  });
});

