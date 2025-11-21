/**
 * UNIT TESTS - UNIFIED PAYMENT SERVICE
 * Tests smart gateway selection and failover logic
 */

import paymentService from '../../../src/services/payment-service/payment.service';
import cashfreeService from '../../../src/services/payment-service/cashfree.service';
import razorpayService from '../../../src/services/payment-service/razorpay.service';
import { PAYMENT_GATEWAY_LOGIC } from '../../../src/config/payment.config';
import { logger } from '../../../src/utils/logger';

jest.mock('../../../src/services/payment-service/cashfree.service');
jest.mock('../../../src/services/payment-service/razorpay.service');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Unified Payment Service', () => {
  const mockPaymentRequest = {
    amount: 100000, // 1000 INR in paise
    currency: 'INR' as const,
    orderId: 'order-123',
    customer: {
      id: 'cust-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    },
    returnUrl: 'https://example.com/return',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Gateway Selection', () => {
    it('should select Razorpay for amounts <= ₹600', async () => {
      const request = { ...mockPaymentRequest, amount: 60000 }; // ₹600
      (razorpayService.createOrder as jest.Mock).mockResolvedValueOnce({
        id: 'rzp-order-123',
      });

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('razorpay');
      expect(razorpayService.createOrder).toHaveBeenCalled();
      expect(cashfreeService.createOrder).not.toHaveBeenCalled();
    });

    it('should select Cashfree for amounts > ₹600', async () => {
      const request = { ...mockPaymentRequest, amount: 60100 }; // ₹601
      (cashfreeService.createOrder as jest.Mock).mockResolvedValueOnce({
        cfOrderId: 'cf-order-123',
        paymentSessionId: 'session-123',
      });

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('cashfree');
      expect(cashfreeService.createOrder).toHaveBeenCalled();
      expect(razorpayService.createOrder).not.toHaveBeenCalled();
    });

    it('should use preferred gateway when specified', async () => {
      const request = { ...mockPaymentRequest, amount: 100000, gateway: 'cashfree' as const };
      (cashfreeService.createOrder as jest.Mock).mockResolvedValueOnce({
        cfOrderId: 'cf-order-123',
        paymentSessionId: 'session-123',
      });

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('cashfree');
      expect(logger.info).toHaveBeenCalledWith('Using preferred gateway', { gateway: 'cashfree' });
    });
  });

  describe('Create Order', () => {
    it('should create Cashfree order successfully', async () => {
      const request = { ...mockPaymentRequest, amount: 100000 };
      (cashfreeService.createOrder as jest.Mock).mockResolvedValueOnce({
        cfOrderId: 'cf-order-123',
        paymentSessionId: 'session-123',
      });

      const result = await paymentService.createOrder(request);

      expect(result.success).toBe(true);
      expect(result.gateway).toBe('cashfree');
      expect(result.gatewayOrderId).toBe('cf-order-123');
      expect(result.paymentSessionId).toBe('session-123');
    });

    it('should create Razorpay order successfully', async () => {
      const request = { ...mockPaymentRequest, amount: 50000 };
      (razorpayService.createOrder as jest.Mock).mockResolvedValueOnce({
        id: 'rzp-order-123',
      });

      const result = await paymentService.createOrder(request);

      expect(result.success).toBe(true);
      expect(result.gateway).toBe('razorpay');
      expect(result.gatewayOrderId).toBe('rzp-order-123');
    });

    it('should failover to alternate gateway on error', async () => {
      const request = { ...mockPaymentRequest, amount: 100000 };
      (cashfreeService.createOrder as jest.Mock).mockRejectedValueOnce(new Error('Cashfree error'));
      (razorpayService.createOrder as jest.Mock).mockResolvedValueOnce({
        id: 'rzp-order-123',
      });

      const result = await paymentService.createOrder(request);

      expect(result.gateway).toBe('razorpay');
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('failed, attempting failover'),
        expect.any(Object)
      );
    });

    it('should throw error if both gateways fail', async () => {
      const request = { ...mockPaymentRequest, amount: 100000 };
      (cashfreeService.createOrder as jest.Mock).mockRejectedValueOnce(new Error('Cashfree error'));
      (razorpayService.createOrder as jest.Mock).mockRejectedValueOnce(new Error('Razorpay error'));

      await expect(paymentService.createOrder(request)).rejects.toThrow('Both payment gateways failed');
      expect(logger.error).toHaveBeenCalledWith('Failover also failed', expect.any(Object));
    });
  });

  describe('Verify Payment', () => {
    it('should verify Cashfree payment', async () => {
      (cashfreeService.verifyPayment as jest.Mock).mockResolvedValueOnce({
        orderStatus: 'PAID',
      });

      const result = await paymentService.verifyPayment('cashfree', 'order-123');

      expect(cashfreeService.verifyPayment).toHaveBeenCalledWith('order-123');
      expect(result.orderStatus).toBe('PAID');
    });

    it('should verify Razorpay payment with signature', async () => {
      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValueOnce(true);
      (razorpayService.fetchPayment as jest.Mock).mockResolvedValueOnce({
        id: 'pay-123',
        status: 'captured',
      });

      const result = await paymentService.verifyPayment(
        'razorpay',
        'order-123',
        'pay-123',
        'signature-123'
      );

      expect(razorpayService.verifyPaymentSignature).toHaveBeenCalledWith(
        'order-123',
        'pay-123',
        'signature-123'
      );
      expect(result.status).toBe('captured');
    });

    it('should reject Razorpay payment with invalid signature', async () => {
      (razorpayService.verifyPaymentSignature as jest.Mock).mockReturnValueOnce(false);

      await expect(
        paymentService.verifyPayment('razorpay', 'order-123', 'pay-123', 'invalid-signature')
      ).rejects.toThrow('Invalid payment signature');
    });

    it('should require payment ID and signature for Razorpay', async () => {
      await expect(
        paymentService.verifyPayment('razorpay', 'order-123')
      ).rejects.toThrow('Payment ID and signature required for Razorpay');
    });
  });

  describe('Process Refund', () => {
    it('should process Cashfree refund', async () => {
      (cashfreeService.processRefund as jest.Mock).mockResolvedValueOnce({
        refundId: 'refund-123',
        status: 'SUCCESS',
      });

      const result = await paymentService.processRefund(
        'cashfree',
        'order-123',
        50000, // ₹500 in paise
        'refund-123'
      );

      expect(cashfreeService.processRefund).toHaveBeenCalledWith('order-123', 500, 'refund-123');
      expect(result.status).toBe('SUCCESS');
    });

    it('should process Razorpay refund', async () => {
      (razorpayService.processRefund as jest.Mock).mockResolvedValueOnce({
        id: 'refund-123',
        amount: 50000,
      });

      const result = await paymentService.processRefund(
        'razorpay',
        'order-123',
        50000,
        'refund-123'
      );

      expect(razorpayService.processRefund).toHaveBeenCalledWith('order-123', 50000);
      expect(result.amount).toBe(50000);
    });
  });
});
